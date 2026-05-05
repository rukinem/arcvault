import hre from "hardhat";
import * as fs from "node:fs";
import * as path from "node:path";

const { ethers, network } = hre;

// Native USDC on Arc.
const USDC = "0x3600000000000000000000000000000000000000";

// Initial liquidity: 20 USDC + 18.4 EURC ≈ EUR/USD rate at launch.
// Lower seed since deployer is testnet-funded and we already used USDC for
// staking deploy + reward pool. Tweak to taste.
const SEED_USDC = ethers.parseUnits("20", 6);
const SEED_EURC = ethers.parseUnits("18.4", 6);

async function main() {
  if (network.name !== "arcTestnet") {
    console.warn(`[!] Network is '${network.name}', expected 'arcTestnet'.`);
  }

  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // 1. Deploy MockEURC
  console.log("\n📦 Deploying MockEURC...");
  const EURCFactory = await ethers.getContractFactory("MockEURC");
  const eurc = await EURCFactory.deploy();
  await eurc.waitForDeployment();
  const eurcAddress = await eurc.getAddress();
  console.log("  EURC:", eurcAddress);

  // 2. Deploy SimpleAMM (token0 = USDC, token1 = EURC)
  console.log("\n📦 Deploying SimpleAMM...");
  const AmmFactory = await ethers.getContractFactory("SimpleAMM");
  const amm = await AmmFactory.deploy(USDC, eurcAddress);
  await amm.waitForDeployment();
  const ammAddress = await amm.getAddress();
  console.log("  AMM: ", ammAddress);

  // 3. Mint EURC to deployer for seeding liquidity
  console.log("\n💰 Minting EURC to deployer...");
  const mintTx = await eurc.mint(deployer.address, SEED_EURC * 5n); // 5x the seed
  await mintTx.wait();

  // 4. Approve both tokens to AMM
  console.log("\n🔓 Approving USDC + EURC to AMM...");
  const usdc = new ethers.Contract(
    USDC,
    [
      "function approve(address,uint256) returns (bool)",
      "function balanceOf(address) view returns (uint256)",
    ],
    deployer
  );
  await (await usdc.approve(ammAddress, ethers.MaxUint256)).wait();
  await (await eurc.approve(ammAddress, ethers.MaxUint256)).wait();

  // 5. Seed liquidity
  console.log("\n💧 Seeding initial liquidity...");
  console.log(
    "  USDC:",
    ethers.formatUnits(SEED_USDC, 6),
    "/ EURC:",
    ethers.formatUnits(SEED_EURC, 6)
  );
  const liqTx = await amm.addLiquidity(SEED_USDC, SEED_EURC);
  const rcpt = await liqTx.wait();
  console.log("  Tx:", rcpt?.hash);

  console.log("\n✅ Deployed");
  console.log("  EURC:           ", eurcAddress);
  console.log("  AMM:            ", ammAddress);
  console.log("  Initial USDC:   ", ethers.formatUnits(SEED_USDC, 6));
  console.log("  Initial EURC:   ", ethers.formatUnits(SEED_EURC, 6));
  console.log(
    "  Implied price:  1 USDC =",
    (Number(SEED_EURC) / Number(SEED_USDC)).toFixed(4),
    "EURC"
  );

  // 6. Auto-update .env.local
  const envPath = path.resolve(process.cwd(), ".env.local");
  let env = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";

  function upsert(key: string, value: string) {
    const re = new RegExp(`^${key}=.*$`, "m");
    if (re.test(env)) env = env.replace(re, `${key}=${value}`);
    else env += (env && !env.endsWith("\n") ? "\n" : "") + `${key}=${value}\n`;
  }

  upsert("NEXT_PUBLIC_EURC_ADDRESS", eurcAddress);
  upsert("NEXT_PUBLIC_AMM_ADDRESS", ammAddress);
  fs.writeFileSync(envPath, env);
  console.log(`\n📝 Wrote NEXT_PUBLIC_EURC_ADDRESS + NEXT_PUBLIC_AMM_ADDRESS to ${envPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
