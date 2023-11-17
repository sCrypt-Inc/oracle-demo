import { Rabin } from 'rabinsig';

const rabin = new Rabin();
const privKey = rabin.generatePrivKey();
console.log(`RABIN_PRIV_P=${privKey.p.toString()}`);
console.log(`RABIN_PRIV_Q=${privKey.q.toString()}`);
