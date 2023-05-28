import { networks, payments, Psbt } from "bitcoinjs-lib";
import { broadcast, waitUntilUTXO } from "./blockstream";
import { ECPair } from "./libs";
import { toXOnly } from "./pubkey";
import { tweakSigner } from "./tweak";
import { IUTXO, networkType } from "../types";
import { selectUTXO } from "./utxo";

export const sendBtc = async (
  config: {wif: string,
  senderAddress: string,
  recipientAddress: string,
  amount: number,
  networkType: networkType,
  feeRate: number }
): Promise<{ txid: string; hex: string }> => {

  const {wif, senderAddress, recipientAddress, amount, networkType, feeRate } = config;

  const network =
    networkType == "testnet" ? networks.testnet : networks.bitcoin;

  const keyPair = ECPair.fromWIF(wif, network);
  const tweaked = tweakSigner(keyPair, { network });

  const p2tr = payments.p2tr({
    pubkey: toXOnly(tweaked.publicKey),
    network: network,
  });

  const taprootAddress = p2tr.address ?? "";

  const utxos = await waitUntilUTXO(taprootAddress, networkType);

  const psbt = new Psbt({ network: network });

  const vSize = psbt.extractTransaction().virtualSize();
  const totalFee = feeRate * vSize;
  const totalInput = amount + totalFee;

  const usedUtoxs = await selectUTXO(utxos, totalInput);
  const totalUtxoValue = usedUtoxs.map((utxo: IUTXO) => utxo.value).reduce((partialSum, a) => partialSum + a, 0);
  
  const changeAmount = totalUtxoValue - amount;

  console.log('amount', amount);
  console.log('total fee', totalFee);
  console.log('change amount', changeAmount);
  console.log('change amout minus fee', changeAmount - totalFee);
  console.log('total utxo value (total input)', totalUtxoValue);
  
  for(const utxo of usedUtoxs) {
    psbt.addInput({
      hash: utxo.txid,
      index: utxo.vout,
      witnessUtxo: { value: utxo.value, script: p2tr.output! },
      tapInternalKey: toXOnly(keyPair.publicKey),
    });
  };

  psbt.addOutput({
    address: recipientAddress,
    value: amount,
  });

  psbt.addOutput({
    address: senderAddress,
    value: changeAmount - totalFee,
  });
  
  psbt.signAllInputs(tweaked);
  psbt.finalizeAllInputs();

  const transaction = psbt.extractTransaction();
  const hex = transaction.toHex();
  const tx = psbt.extractTransaction();
  const txid = await broadcast(tx.toHex(), networkType);

  return { hex, txid };
};
