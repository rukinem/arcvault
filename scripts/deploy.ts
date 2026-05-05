import hre from "hardhat";
import * as fs from "node:fs";
import * as path from "node:path";

const { ethers, network } = hre;

// Native USDC system contract on Arc (also used as gas token).
const USDC = "0x3600000000000000000000000000000000000000";
// 7.84% APY in basis points.
const APY_BPS = 784;

async function main() {
  if (network.name !== "arcTestnet") {
    console.warn(
      `[!] You are deploying to '${network.name}'. Expected 'arcTestnet'.`
    );
  }

  const [deployer] = await ethers.getSigners();
  if (!deployer) {
    throw new Error(
      "No deployer account configured. Set DEPLOYER_PRIVATE_KEY in .env.local."
    );
  }

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer:        ", deployer.address);
  console.log(
    "Balance (USDC):  ",
    ethers.formatUnits(balance, 6),
    "(Arc uses USDC as native gas)"
  );
  if (balance === 0n) {
    throw new Error(
      "Deployer has 0 USDC. Fund it via https://faucet.circle.com (Arc Testnet)."
    );
  }

  console.log("\nDeploying USDCStaking...");
  const Factory = await ethers.getContractFactory("USDCStaking");
  const staking = await Factory.deploy(USDC, APY_BPS);
  await staking.waitForDeployment();

  const address = await staking.getAddress();
  const txHash = staking.deploymentTransaction()?.hash;

  console.log("\n✅ Deployed");
  console.log("  Address:   ", address);
  console.log("  Tx hash:   ", txHash);
  console.log("  Explorer:  ", `https://explorer.testnet.arc.network/address/${address}`);
  console.log("  USDC:      ", USDC);
  console.log("  APY (bps): ", APY_BPS, `(${APY_BPS / 100}%)`);

  // Auto-update .env.local so the frontend picks it up.
  const envPath = path.resolve(process.cwd(), ".env.local");
  let env = "";
  if (fs.existsSync(envPath)) env = fs.readFileSync(envPath, "utf8");
  const line = `NEXT_PUBLIC_STAKING_ADDRESS=${address}`;
  if (env.includes("NEXT_PUBLIC_STAKING_ADDRESS=")) {
    env = env.replace(/NEXT_PUBLIC_STAKING_ADDRESS=.*/g, line);
  } else {
    env += (env.endsWith("\n") || env === "" ? "" : "\n") + line + "\n";
  }
  fs.writeFileSync(envPath, env);
  console.log(`\n📝 Wrote NEXT_PUBLIC_STAKING_ADDRESS to ${envPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
