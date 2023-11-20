import { Controller, Get } from '@nestjs/common';
import { RabinService } from './rabin/rabin.service';
import { toBufferLE } from './utils';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PriceBet } from './contracts/priceBet';
import {
  toByteString,
  bsv,
  toHex,
  PubKey,
  TestWallet,
  DefaultProvider,
  findSig,
  MethodCallOptions,
} from 'scrypt-ts';
import axios from 'axios';
import { myPrivateKey, myPublicKey } from './helpers/bsvPrivKey';
import artifact from '../artifacts/priceBet.json';

@Controller()
export class AppController {
  constructor(private readonly rabinService: RabinService) {}

  @Get()
  @ApiTags('info')
  @ApiOperation({ summary: 'health check' })
  healthCheck(): string {
    return 'OK';
  }

  @Get('/info')
  @ApiTags('info')
  @ApiOperation({ summary: 'get server Rabin public key' })
  getInfo() {
    return {
      publicKey: toBufferLE(this.rabinService.publicKey).toString('hex'),
    };
  }

  @Get('/demo')
  @ApiTags('demo')
  @ApiOperation({ summary: 'how smart contract use this oracle' })
  async demo() {
    const host = 'https://oracle-demo.vercel.app';
    // get oracle public key
    const oraclePubKey = await axios
      .get(`${host}/info`)
      .then((r) => r.data)
      .then((r) => PriceBet.parsePubKey(r));
    console.log('oracle public key:', oraclePubKey);
    // load contract
    PriceBet.loadArtifact(artifact);
    // create contract instance
    const now = BigInt(Date.parse(new Date().toString()) / 1000);
    const timestampFrom = now - 3600n;
    const timestampTo = now + 3600n;
    const trandingPair = toByteString('BSV-USDC', true);
    const targetPrice = 10000n;
    const decimal = 4n;
    const myPubKey = myPublicKey;
    const bobPubKey = bsv.PrivateKey.fromRandom(bsv.Networks.testnet).publicKey;
    const instance = new PriceBet(
      targetPrice,
      decimal,
      trandingPair,
      timestampFrom,
      timestampTo,
      oraclePubKey,
      PubKey(toHex(myPubKey)),
      PubKey(toHex(bobPubKey)),
    );
    // connect contract instance to a testnet signer
    const signer = new TestWallet(
      myPrivateKey,
      new DefaultProvider({ network: bsv.Networks.testnet }),
    );
    await instance.connect(signer);
    // contract deploy
    const deployTx = await instance.deploy();
    console.log('deploy tx:', deployTx.id);
    // get oracle price response
    const priceResponse = await axios
      .get(`${host}/v1/price/USDC/BSV`)
      .then((r) => r.data);
    const priceData = PriceBet.parseData(priceResponse);
    const priceSig = PriceBet.parseSig(priceResponse);
    // contract call
    const winnerPubKey = myPubKey;
    const { tx: callTx } = await instance.methods.unlock(
      priceData,
      priceSig,
      (sigResps) => findSig(sigResps, winnerPubKey),
      {
        pubKeyOrAddrToSign: winnerPubKey,
      } as MethodCallOptions<PriceBet>,
    );
    console.log('call tx:', callTx.id);
    return {
      deploy: deployTx.id,
      call: callTx.id,
    };
  }
}
