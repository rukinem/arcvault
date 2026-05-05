import hre from "hardhat";
const { ethers } = hre;

// Native USDC system contract on Arc.
const USDC = "0x3600000000000000000000000000000000000000";

// Edit these two before running, OR pass via env vars STAKING_ADDRESS / FUND_AMOUNT.
const DEFAULT_AMOUNT_USDC = "10"; // 10 USDC

async function main() {
  const stakingAddress =
    process.env.STAKING_ADDRESS || process.env.NEXT_PUBLIC_STAKING_ADDRESS;
  if (!stakingAddress || stakingAddress === "0x0000000000000000000000000000000000000000") {
    throw new Error(
      "Set STAKING_ADDRESS (or NEXT_PUBLIC_STAKING_ADDRESS) in .env.local first."
    );
  }
  const amountStr = process.env.FUND_AMOUNT || DEFAULT_AMOUNT_USDC;
  const amount = ethers.parseUnits(amountStr, 6);

  const [signer] = await ethers.getSigners();
  console.log("Funder:    ", signer.address);
  console.log("Staking:   ", stakingAddress);
  console.log("Amount:    ", amountStr, "USDC");

  const usdc = new ethers.Contract(
    USDC,
    [
      "function transfer(address,uint256) returns (bool)",
      "function balanceOf(address) view returns (uint256)",
    ],
    signer
  );

  const before = (await usdc.balanceOf(stakingAddress)) as bigint;
  console.log("Pool balance (before):", ethers.formatUnits(before, 6), "USDC");

  const tx = await usdc.transfer(stakingAddress, amount);
  console.log("Tx sent:", tx.hash);
  await tx.wait();

  const after = (await usdc.balanceOf(stakingAddress)) as bigint;
  console.log("Pool balance (after): ", ethers.formatUnits(after, 6), "USDC");
  console.log("✅ Reward pool funded.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
