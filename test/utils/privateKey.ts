import { bsv } from 'scrypt-ts';
import * as dotenv from 'dotenv';

export function genPrivKey(network: bsv.Networks.Network): bsv.PrivateKey {
  dotenv.config({
    path: '.env',
  });

  const privKeyStr = process.env.PRIVATE_KEY;
  let privKey: bsv.PrivateKey;
  if (privKeyStr) {
    privKey = bsv.PrivateKey.fromWIF(privKeyStr as string);
    console.log(`Private key already present ...`);
  } else {
    privKey = bsv.PrivateKey.fromRandom(network);
    console.log('Private key generated ...');
    console.log(`PRIVATE_KEY=${privKey}`);
    console.log(`Publickey: ${privKey.publicKey}`);
    console.log(`Address: ${privKey.toAddress()}`);
  }

  const fundMessage = `You can fund its address '${privKey.toAddress()}' from the sCrypt faucet https://scrypt.io/faucet`;

  console.log(fundMessage);

  return privKey;
}

export const myPrivateKey = genPrivKey(bsv.Networks.testnet);

export const myPublicKey = bsv.PublicKey.fromPrivateKey(myPrivateKey);
export const myAddress = myPublicKey.toAddress();
