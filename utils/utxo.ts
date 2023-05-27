import { IUTXO } from "../types";

export const selectUTXO = async (utxos: IUTXO[], threshold: number): Promise<IUTXO[]> => {
    const usedUtxos: IUTXO[] = [];
    let accValue = 0;
    for(const utxo of utxos) {
        usedUtxos.push(utxo);
        accValue += utxo.value;

        if(accValue >= threshold) {
            return usedUtxos
        }
    }
    throw Error("Not enough UTXO value for transaction");
};
