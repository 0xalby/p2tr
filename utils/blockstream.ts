import axios, { Axios, AxiosResponse } from "axios";
import { networkType } from "../types";

export const blockstream = (networkType: networkType): Axios => {
  const baseURL = `https://blockstream.info${
    networkType == "testnet" ? "/testnet/" : "/"
  }api`;
  console.log(baseURL);
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
