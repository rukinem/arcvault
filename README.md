# ArcVault — USDC Staking dApp on Arc Testnet

Modern, glassmorphic staking dApp built on **Circle's Arc L1** (testnet).
Users deposit native USDC, earn linear-APY rewards, and pay gas in dollars.

## Stack

- **Next.js 14** (App Router) + TypeScript
- **TailwindCSS** with custom aurora / glass theme
- **wagmi v2 + viem + RainbowKit** for wallet connection
- **Recharts** for APY analytics
- **Foundry** for the Solidity contract
- Deployed onto **Arc Testnet** — Chain ID `5042002`

## Architecture

```
staking-dapp/
├── app/                          # Next.js routes + providers
├── components/                   # UI (hero, stake panel, stats, table…)
├── lib/
│   ├── wagmi.ts                  # Arc testnet chain definition
│   ├── contracts.ts              # ABIs + addresses
│   └── hooks.ts                  # useUsdcBalance, useUserPosition…
└── contracts/                    # Foundry project
    ├── src/USDCStaking.sol
    └── script/Deploy.s.sol
```

## Quick start

### 1. Deploy the staking contract

```bash
cd contracts
forge install foundry-rs/forge-std --no-commit
forge build

# Fund a wallet via https://faucet.circle.com (Arc Testnet)
export PRIVATE_KEY=0xyour_private_key

forge script script/Deploy.s.sol:Deploy \
  --rpc-url arc_testnet \
  --private-key $PRIVATE_KEY \
  --broadcast
```

Copy the printed `USDCStaking deployed at:` address.

### 2. Fund the reward pool (optional, for paying out yield)

```bash
# 100 USDC = 100000000 (6 decimals)
cast send 0x3600000000000000000000000000000000000000 \
  "transfer(address,uint256)" 0xYourStakingAddress 100000000 \
  --rpc-url arc_testnet --private-key $PRIVATE_KEY
```

### 3. Run the frontend

```bash
cd ..        # back to staking-dapp/
npm install
copy .env.example .env.local       # Windows
# (or `cp .env.example .env.local` on macOS/Linux)

# Edit .env.local:
#   NEXT_PUBLIC_WC_PROJECT_ID=...        (https://cloud.walletconnect.com)
#   NEXT_PUBLIC_STAKING_ADDRESS=0x...    (from step 1)

npm run dev
```

Open http://localhost:3000

### 4. Use the dApp

1. Click **Connect Wallet** → choose MetaMask / Rainbow / WalletConnect.
2. Switch network to **Arc Testnet** (the dApp will prompt automatically).
3. Click **Get testnet USDC** → mint from the Circle faucet.
4. Enter an amount → first tx is **Approve**, second is **Stake**.
5. Watch your principal accrue rewards in real time. Click **Claim** anytime.

## Arc network reference

| | Value |
|---|---|
| Chain ID | `5042002` |
| RPC URL | `https://rpc.testnet.arc.network` |
| Explorer | `https://explorer.testnet.arc.network` |
| Native USDC (system contract) | `0x3600000000000000000000000000000000000000` |
| Native gas token | USDC (decimals = 6) |
| Faucet | https://faucet.circle.com |

## Contract overview — `USDCStaking.sol`

| Function | Description |
|---|---|
| `stake(uint256)` | Pulls USDC via `transferFrom`. Requires prior `approve`. |
| `unstake(uint256)` | Withdraws principal + accrued rewards. |
| `claim()` | Harvests rewards without touching principal. |
| `pendingRewards(address)` | View current accrued rewards. |
| `positions(address)` | Returns `(principal, rewardDebt, lastUpdate)`. |
| `setApy(uint256 bps)` | Owner-only. `784` = 7.84%. |

Rewards accrue linearly: `principal × apyBps × elapsed / (10000 × 365 days)`.

## Notes

- Gas on Arc is paid in **USDC** (~$0.009 per tx). You don't need ETH.
- Sub-second finality via Malachite consensus.
- The contract is intentionally minimal — it's a hackathon-grade reference,
  not audited. Do not use as-is on mainnet.
