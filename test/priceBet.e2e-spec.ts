import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { V1Module } from '../src/v1.module';
import { PriceBet } from '../src/contracts/priceBet';
import { AppModule } from '../src/app.module';
import {
  bsv,
  toByteString,
  PubKey,
  toHex,
  findSig,
  MethodCallOptions,
} from 'scrypt-ts';
import { myPublicKey } from './utils/privateKey';
import { getDefaultSigner } from './utils/helper';

jest.setTimeout(60000); // https://stackoverflow.com/a/72031538

describe('Test /v1/price in contract PriceBet (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [V1Module, AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // load contract
    PriceBet.loadArtifact();
  });

  async function get(path: string) {
    return request(app.getHttpServer())
      .get(path)
      .then((r) => r.body);
  }

  it('should pass', async () => {
    // get oracle public key
    const pubKeyResponse = await get('/info');
    const oraclePubKey = PriceBet.parsePubKey(pubKeyResponse);
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
    // connect contract instance to the default signer
    await instance.connect(getDefaultSigner());
    // contract deploy
    await instance.deploy();
    // get oracle price response
    const priceResponse = await get('/v1/price/USDC/BSV');
    const priceData = PriceBet.parseData(priceResponse);
    const priceSig = PriceBet.parseSig(priceResponse);
    // contract call
    const winnerPubKey = myPubKey;
    const call = async () =>
      await instance.methods.unlock(
        priceData,
        priceSig,
        (sigResps) => findSig(sigResps, winnerPubKey),
        {
          pubKeyOrAddrToSign: winnerPubKey,
        } as MethodCallOptions<PriceBet>,
      );
    await expect(call()).resolves.not.toThrow(); // https://stackoverflow.com/a/54548606
  });
});
