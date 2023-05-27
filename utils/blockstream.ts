import axios, { Axios, AxiosResponse } from "axios";
import { networkType, IUTXO } from "../types";

export const blockstream = (networkType: networkType): Axios => {
  const baseURL = `https://blockstream.info${
    networkType == "testnet" ? "/testnet/" : "/"
  }api`;
  return new axios.Axios({
    baseURL: baseURL,
  });
};

export async function broadcast(txHex: string, networkType: networkType) {
  const response: AxiosResponse<string> = await blockstream(networkType).post(
    "/tx",
    txHex
  );
  return response.data;
}

export async function waitUntilUTXO(address: string, networkType: networkType) {
  return new Promise<IUTXO[]>((resolve, reject) => {
      let intervalId: any;
      const checkForUtxo = async () => {
          try {
              const response: AxiosResponse<string> = await blockstream(networkType).get(`/address/${address}/utxo`);
              const data: IUTXO[] = response.data ? JSON.parse(response.data) : undefined;
              console.log(data);
              if (data.length > 0) {
                  resolve(data);
                  clearInterval(intervalId);
              }
          } catch (error) {
              reject(error);
              clearInterval(intervalId);
          }
      };
      intervalId = setInterval(checkForUtxo, 10000);
  });
}