import { ethers } from "ethers";
import * as fs from "node:fs";
import * as path from "node:path";

const wallet = ethers.Wallet.createRandom();

console.log("\n🆕 New burner wallet generated\n");
console.log("  Address:     ", wallet.address);
console.log("  Private key: ", wallet.privateKey);
console.log("  Mnemonic:    ", wallet.mnemonic?.phrase);

const envPath = path.resolve(process.cwd(), ".env.local");
let env = "";
if (fs.existsSync(envPath)) env = fs.readFileSync(envPath, "utf8");

function upsert(key: string, value: string) {
  const re = new RegExp(`^${key}=.*$`, "m");
  if (re.test(env)) env = env.replace(re, `${key}=${value}`);
  else env += (env && !env.endsWith("\n") ? "\n" : "") + `${key}=${value}\n`;
}

upsert("DEPLOYER_PRIVATE_KEY", wallet.privateKey);
upsert("DEPLOYER_ADDRESS", wallet.address);
if (!/^NEXT_PUBLIC_WC_PROJECT_ID=/m.test(env))
  upsert("NEXT_PUBLIC_WC_PROJECT_ID", "demo");
if (!/^NEXT_PUBLIC_STAKING_ADDRESS=/m.test(env))
  upsert(
    "NEXT_PUBLIC_STAKING_ADDRESS",
    "0x0000000000000000000000000000000000000000"
  );

fs.writeFileSync(envPath, env);

console.log(`\n📝 Saved to ${envPath}`);
console.log("\nNext step:");
console.log("  1. Buka https://faucet.circle.com");
console.log("  2. Pilih Arc Testnet → USDC");
console.log(`  3. Paste address di atas (${wallet.address})`);
console.log("  4. Click Send 10 USDC");
console.log("  5. Balik ke sini, ketik 'sudah' biar saya deploy.\n");
