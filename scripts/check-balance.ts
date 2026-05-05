import { ethers } from "ethers";

const RPC = "https://rpc.testnet.arc.network";
const ADDRESS = "0xbAa21c2c37B8783C9E508439d0c8f63D5C1Cddc3";

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC);
  const balance = await provider.getBalance(ADDRESS);
  console.log("Address:", ADDRESS);
  console.log("Balance:", ethers.formatUnits(balance, 6), "USDC");
  const block = await provider.getBlockNumber();
  console.log("Block:  ", block);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
