import { networks, payments, Psbt } from "bitcoinjs-lib";
import { blockstream, broadcast } from "./blockstream";
import { ECPair } from "./libs";
import { toXOnly } from "./pubkey";
import { tweakSigner } from "./tweak";
import { networkType } from "../types";

import axios from 'axios';

export const sendBtc = async (
  wif: string,
  recipientAddress: string,
  amount: number,
  networkType: networkType
): Promise<{ txid: string; hex: string }> => {
  const network =
    networkType == "testnet" ? networks.testnet : networks.bitcoin;

  const keyPair = ECPair.fromWIF(wif, network);
  const tweaked = tweakSigner(keyPair, { network });

  const p2tr = payments.p2tr({
    pubkey: toXOnly(tweaked.publicKey),
    network: network,
  });

  const taprootAddress = p2tr.address;

  //need to use blockstream function
  const apiUrl = `https://blockstream.info${networkType == 'testnet' ? '/testnet/api/' : '/'}address/${taprootAddress}/utxo`;
  const response = await axios.get(apiUrl);
  const utxos = response.data; 

  const psbt = new Psbt({ network: network });

  psbt.addInput({
    hash: utxos[0].txid,
    index: utxos[0].vout,
    witnessUtxo: { value: utxos[0].value, script: p2tr.output! },
    tapInternalKey: toXOnly(keyPair.publicKey),
  });

  psbt.addOutput({
    address: recipientAddress,
    value: amount,
  });

  psbt.signInput(0, tweaked);
  psbt.finalizeAllInputs();

  const transaction = psbt.extractTransaction();
  const hex = transaction.toHex();
  const tx = psbt.extractTransaction();
  const txid = await broadcast(tx.toHex(), networkType);

  return { hex, txid };
};
