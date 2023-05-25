import { initEccLib } from "bitcoinjs-lib";
import { ECPairFactory, ECPairAPI, TinySecp256k1Interface } from "ecpair";

export const tinysecp: TinySecp256k1Interface = require("tiny-secp256k1");
initEccLib(tinysecp as any);
export const ECPair: ECPairAPI = ECPairFactory(tinysecp);
