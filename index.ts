import dotenv from "dotenv";
import { sendBtc } from "./utils/transaction";
dotenv.config();

const A_WIF = process.env.A_WIF;
const A_ADDRESS = process.env.A_ADDRESS;
const B_WIF = process.env.B_WIF
const B_ADDRESS = process.env.B_ADDRESS;
const amount = 500; // satoshis
const network = "testnet";

const main = async () => {
  if (!A_WIF || !A_ADDRESS || !B_WIF || !B_ADDRESS) {
    throw new Error("Environment variables not set");
  }
  try {
    const result = await sendBtc({
      networkType: network,
      wif: A_WIF,
      senderAddress: A_ADDRESS,
      recipientAddress: B_ADDRESS,
      amount: amount,
    });
    console.log(`tx:`, result.txid);
  } catch (error) {
    console.log("Error sending BTC:", error);
  }
};

main().catch((error) => {
  console.log("Error running process:", error);
});
