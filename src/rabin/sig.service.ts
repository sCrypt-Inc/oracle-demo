import { Injectable } from '@nestjs/common';
import { Rabin, RabinPrivateKey, RabinPublicKey, serialize } from 'rabinsig';

@Injectable()
export class SigService {
  private rabin = new Rabin();

  private privKey: RabinPrivateKey = {
    p: BigInt(process.env.RABIN_PRIV_P || 7),
    q: BigInt(process.env.RABIN_PRIV_Q || 11),
  };

  private pubKey: RabinPublicKey = this.rabin.privKeyToPubKey(this.privKey);

  get publicKey(): RabinPublicKey {
    return this.pubKey;
  }

  sign(dataBuffer: Buffer) {
    const dataHex = dataBuffer.toString('hex');
    const sig = this.rabin.sign(dataHex, this.privKey);
    return {
      data: dataHex,
      signature: serialize(sig),
    };
  }
}
