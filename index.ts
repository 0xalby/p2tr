import dotenv from "dotenv";
import { sendBtc } from "./utils/transaction";
dotenv.config();

const wif = process.env.WIF;
const to = process.env.TO_ADDRESS;
const amount = 15; // satoshis
const network = "testnet";

const main = async () => {
  if (!wif || !to) {
    throw new Error("Environment variables not set");
  }
  try {
    const result = await sendBtc(wif, to, amount, network);
    console.log(`tx:`, result.txid);
  } catch (error) {
    console.log("Error sending BTC:", error);
  }
};

main().catch((error) => {
  console.log("Error running process:", error);
});
