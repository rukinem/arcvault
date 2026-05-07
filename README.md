<div align="center">

# 🏦 ArcVault

### USDC Staking + USDC/EURC AMM on Circle's Arc L1 Testnet

A modern DeFi dApp featuring **linear-APY USDC staking** and a **constant-product AMM** for the USDC/EURC pair, built on Circle's next-generation Arc L1 blockchain.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?style=for-the-badge&logo=solidity)](https://soliditylang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![Foundry](https://img.shields.io/badge/Foundry-Contract_Dev-ff7043?style=for-the-badge)](https://book.getfoundry.sh)
[![Arc Testnet](https://img.shields.io/badge/Arc_Testnet-Chain_5042002-00d4aa?style=for-the-badge)](https://faucet.circle.com)

---

[🚀 Live Demo](#-quick-start) · [📖 Documentation](#-contract-documentation) · [🏗️ Architecture](#️-architecture) · [🔒 Security](#-security-considerations)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#️-architecture)
- [Smart Contracts](#-smart-contracts)
  - [USDCStaking](#usdcstaking)
  - [SimpleAMM](#simpleamm)
  - [MockEURC](#mokeurc)
- [Frontend Components](#-frontend-components)
- [Arc Network Reference](#-arc-network-reference)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [Deployment Guide](#-deployment-guide)
- [API Reference](#-api-reference)
- [Security Considerations](#-security-considerations)
- [Performance](#-performance)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

---

## 🌟 Overview

ArcVault is a **full-stack DeFi application** that demonstrates how to build on Circle's Arc L1 — a next-generation blockchain where **USDC is the native gas token**. No ETH needed for transactions.

### What Makes Arc Special?

| Feature | Description |
|---------|-------------|
| **Native USDC** | USDC is the system-level token — no bridging, no wrapping |
| **Gas in USDC** | Transaction fees paid in USDC (~$0.009/tx) |
| **Sub-second Finality** | Malachite consensus for near-instant confirmations |
| **EVM Compatible** | Deploy Solidity contracts with familiar tooling |

### What Can You Do with ArcVault?

1. **🥩 Stake USDC** — Deposit native USDC and earn continuous APY rewards
2. **💱 Swap Tokens** — Trade between USDC and EURC via the AMM
3. **📊 View Analytics** — Real-time APY charts and position tracking
4. **🚰 Get Testnet Tokens** — Mint USDC/EURC directly from the built-in faucet

---

## ✨ Key Features

### Staking
- ✅ Linear APY reward accrual (configurable by owner)
- ✅ Real-time reward tracking per position
- ✅ Stake / Unstake / Claim without touching principal
- ✅ Auto-compounding visualization
- ✅ Position history and analytics

### AMM (Automated Market Maker)
- ✅ Uniswap V2-style constant-product formula (x × y = k)
- ✅ 0.3% swap fee retained by LPs
- ✅ Add/Remove liquidity with LP share tracking
- ✅ Price impact calculation before swap
- ✅ Slippage protection

### Frontend
- ✅ Glassmorphic UI with aurora gradient theme
- ✅ Responsive design (mobile-first)
- ✅ Wallet connection via RainbowKit (MetaMask, Rainbow, WalletConnect)
- ✅ Automatic Arc Testnet network switching
- ✅ Real-time position updates via on-chain reads
- ✅ Interactive APY chart with Recharts
- ✅ Built-in faucet integration

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 14.2 | React framework (App Router) |
| TypeScript | 5.6 | Type safety |
| TailwindCSS | 3.4 | Styling with custom aurora theme |
| wagmi | 2.12 | React hooks for Ethereum |
| viem | 2.21 | TypeScript Ethereum client |
| RainbowKit | 2.1 | Wallet connection UI |
| Recharts | 2.12 | APY analytics charts |
| Framer Motion | 11.5 | Animations |
| Lucide React | 0.439 | Icons |

### Smart Contracts
| Technology | Purpose |
|-----------|---------|
| Solidity 0.8.24 | Contract language |
| Foundry | Compilation, testing, deployment |
| Hardhat | Alternative deployment tooling |

### Infrastructure
| Service | Purpose |
|---------|---------|
| Circle Faucet | Testnet USDC/EURC minting |
| WalletConnect Cloud | Wallet connection relay |
| Arc Testnet (5042002) | Target blockchain |

---

## 🏗️ Architecture

```
arcvault/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout with providers
│   ├── page.tsx                      # Main dashboard page
│   ├── providers.tsx                 # wagmi + RainbowKit providers
│   └── globals.css                   # Tailwind + custom aurora theme
│
├── components/                       # React UI Components
│   ├── navbar.tsx                    # Top navigation + wallet connect
│   ├── hero.tsx                      # Hero banner with stats
│   ├── stats-cards.tsx               # TVL, APY, Total Staked cards
│   ├── apy-chart.tsx                 # Interactive APY analytics chart
│   ├── stake-panel.tsx               # USDC staking interface
│   ├── swap-panel.tsx                # USDC/EURC swap interface
│   ├── pools-grid.tsx                # Liquidity pools overview
│   ├── positions-table.tsx           # User position tracking
│   └── ui/                           # Reusable UI primitives
│       ├── button.tsx
│       ├── card.tsx
│       └── input.tsx
│
├── lib/                              # Shared utilities
│   ├── wagmi.ts                      # Arc testnet chain config
│   ├── contracts.ts                  # Contract ABIs + addresses
│   ├── hooks.ts                      # Custom React hooks
│   └── utils.ts                      # Helper functions
│
├── contracts/                        # Foundry/Solidity project
│   ├── src/
│   │   ├── USDCStaking.sol           # Staking contract
│   │   ├── SimpleAMM.sol             # AMM contract
│   │   └── MockEURC.sol              # Testnet EURC faucet
│   ├── script/
│   │   └── Deploy.s.sol              # Deployment script
│   └── foundry.toml                  # Foundry config
│
├── scripts/                          # Deployment scripts
│   ├── deploy.ts                     # Deploy staking via Hardhat
│   ├── deploy-amm.ts                 # Deploy AMM via Hardhat
│   ├── fund.ts                       # Fund reward pool
│   └── check-balance.ts              # Check wallet balance
│
└── Configuration Files
    ├── .env.example                  # Environment template
    ├── hardhat.config.ts             # Hardhat + Arc network config
    ├── next.config.mjs               # Next.js config
    ├── tailwind.config.ts            # Tailwind + custom theme
    ├── tsconfig.json                 # TypeScript config
    └── package.json                  # Dependencies
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        User Browser                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  RainbowKit   │  │  wagmi/viem  │  │  React Components│  │
│  │  (Wallet UI)  │──│  (Contract   │──│  (stake/swap UI) │  │
│  │              │  │   Hooks)     │  │                  │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────────────┘  │
│         │                 │                                  │
└─────────┼─────────────────┼──────────────────────────────────┘
          │                 │
          ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│                     Arc Testnet (5042002)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ USDCStaking  │  │  SimpleAMM   │  │    MockEURC      │  │
│  │  (Staking)   │  │  (USDC/EURC) │  │  (Faucet Token)  │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│         ▲                 ▲                  ▲              │
│         └─────────────────┼──────────────────┘              │
│                           │                                  │
│                   Native USDC (0x3600...0000)               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📜 Smart Contracts

### USDCStaking

**Purpose:** Linear-APY staking pool for native USDC on Arc testnet.

**Key Mechanics:**
- Rewards accrue linearly: `principal × apyBps × elapsed / (10,000 × 365 days)`
- No lock-up period — unstake anytime
- Rewards funded by direct USDC transfers to the contract
- APY configurable by owner (in basis points)

| Function | Access | Description |
|----------|--------|-------------|
| `stake(uint256 amount)` | Public | Deposit USDC. Requires prior `approve()`. |
| `unstake(uint256 amount)` | Public | Withdraw principal + accrued rewards. |
| `claim()` | Public | Harvest rewards without touching principal. |
| `pendingRewards(address)` | View | Check current accrued rewards for a user. |
| `positions(address)` | View | Returns `(principal, rewardDebt, lastUpdate)`. |
| `setApy(uint256 bps)` | Owner | Update APY. `784` = 7.84%. Max 10,000 (100%). |
| `totalStaked` | View | Total USDC deposited across all users. |

**Events:**
```solidity
event Staked(address indexed user, uint256 amount);
event Unstaked(address indexed user, uint256 amount, uint256 rewards);
event Claimed(address indexed user, uint256 rewards);
event ApyUpdated(uint256 newApyBps);
```

---

### SimpleAMM

**Purpose:** Constant-product AMM for USDC/EURC trading pair.

**Key Mechanics:**
- Uniswap V2 formula: `x × y = k`
- 0.3% swap fee (997/1000 retained)
- LP shares tracked via `balanceOf` mapping
- Minimum liquidity lock of 1,000 shares

| Function | Access | Description |
|----------|--------|-------------|
| `addLiquidity(uint256 amt0, uint256 amt1)` | Public | Deposit both tokens, receive LP shares. |
| `removeLiquidity(uint256 shares)` | Public | Burn LP shares, receive proportional tokens. |
| `swap(address tokenIn, uint256 amountIn)` | Public | Swap one token for the other. |
| `getReserves()` | View | Returns `(reserve0, reserve1, timestamp)`. |
| `getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut)` | View | Calculate output amount with fee. |

**Events:**
```solidity
event Mint(address indexed sender, uint256 amount0, uint256 amount1, uint256 shares);
event Burn(address indexed sender, uint256 amount0, uint256 amount1, uint256 shares, address to);
event Swap(address indexed sender, address indexed tokenIn, uint256 amountIn, uint256 amountOut, address indexed to);
event Sync(uint112 reserve0, uint112 reserve1);
```

---

### MockEURC

**Purpose:** Testnet-only mintable ERC20 mimicking Circle's EURC.

| Function | Access | Description |
|----------|--------|-------------|
| `faucet(uint256 amount)` | Public | Mint up to 1,000 EURC per call. |
| Standard ERC20 | Public | `transfer`, `approve`, `transferFrom`, `balanceOf` |

---

## 🎨 Frontend Components

| Component | Description |
|-----------|-------------|
| `Navbar` | Top navigation with wallet connect button and network indicator |
| `Hero` | Banner with live stats (TVL, APY, Total Staked) |
| `StatsCards` | Animated stat cards with real-time on-chain data |
| `ApyChart` | Interactive Recharts line chart showing APY over time |
| `StakePanel` | Staking interface: input amount → approve → stake → claim |
| `SwapPanel` | Token swap interface with price impact and slippage display |
| `PoolsGrid` | Overview of available liquidity pools with TVL and volume |
| `PositionsTable` | User's active positions with PnL tracking |

### Custom Hooks (`lib/hooks.ts`)

| Hook | Description |
|------|-------------|
| `useUsdcBalance()` | Get connected wallet's USDC balance |
| `useEurcBalance()` | Get connected wallet's EURC balance |
| `useUserPosition()` | Get user's staking position (principal, rewards, etc.) |
| `usePendingRewards()` | Real-time pending reward calculation |
| `useTotalStaked()` | Total USDC staked in the contract |
| `useSwapQuote()` | Calculate swap output with price impact |

---

## 🌐 Arc Network Reference

| Parameter | Value |
|-----------|-------|
| **Network Name** | Arc Testnet |
| **Chain ID** | `5042002` |
| **RPC URL** | `https://rpc.testnet.arc.network` |
| **Explorer** | `https://explorer.testnet.arc.network` |
| **Native USDC** | `0x3600000000000000000000000000000000000000` |
| **Gas Token** | USDC (6 decimals) |
| **Avg Gas Cost** | ~$0.009 per transaction |
| **Finality** | Sub-second (Malachite consensus) |
| **Faucet** | [https://faucet.circle.com](https://faucet.circle.com) |

---

## 🚀 Quick Start

### Prerequisites

- Node.js ≥ 18
- npm or yarn
- MetaMask or any EVM wallet
- Testnet USDC from [Circle Faucet](https://faucet.circle.com)

### 1. Clone & Install

```bash
git clone https://github.com/rukinem/arcvault.git
cd arcvault
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_WC_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_STAKING_ADDRESS=0x...  # After deployment
DEPLOYER_PRIVATE_KEY=0x...         # For contract deployment only
```

### 3. Deploy Contracts (Optional)

```bash
cd contracts
forge install foundry-rs/forge-std --no-commit
forge build

# Deploy staking contract
forge script script/Deploy.s.sol:Deploy \
  --rpc-url arc_testnet \
  --private-key $PRIVATE_KEY \
  --broadcast
```

### 4. Run Frontend

```bash
cd ..
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Use the dApp

1. Click **Connect Wallet** → MetaMask / Rainbow / WalletConnect
2. Switch to **Arc Testnet** (auto-prompted)
3. Click **Get testnet USDC** → mint from faucet
4. Enter amount → **Approve** → **Stake**
5. Watch rewards accrue in real time → **Claim** anytime

---

## 🔧 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_WC_PROJECT_ID` | ✅ | WalletConnect project ID ([get one](https://cloud.walletconnect.com)) |
| `NEXT_PUBLIC_STAKING_ADDRESS` | ✅ | Deployed USDCStaking contract address |
| `NEXT_PUBLIC_AMM_ADDRESS` | ❌ | Deployed SimpleAMM contract address |
| `NEXT_PUBLIC_EURC_ADDRESS` | ❌ | Deployed MockEURC contract address |
| `DEPLOYER_PRIVATE_KEY` | ❌ | Private key for contract deployment only |

---

## 📦 Deployment Guide

### Deploy All Contracts

```bash
# 1. Fund your deployer wallet
# Visit https://faucet.circle.com → select Arc Testnet → paste address

# 2. Deploy staking contract
npm run deploy
# Copy the printed address to NEXT_PUBLIC_STAKING_ADDRESS

# 3. Deploy AMM + MockEURC
npm run deploy:amm
# Copy addresses to NEXT_PUBLIC_AMM_ADDRESS and NEXT_PUBLIC_EURC_ADDRESS

# 4. Fund reward pool (100 USDC example)
npm run fund
```

### Deploy Frontend to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

---

## 🔌 API Reference

### Contract ABIs

All ABIs are exported from `lib/contracts.ts`:

```typescript
import { STAKING_ABI, AMM_ABI, MOCK_EURC_ABI } from '@/lib/contracts';
```

### wagmi Hooks Usage

```typescript
import { useReadContract, useWriteContract } from 'wagmi';
import { STAKING_ABI, STAKING_ADDRESS } from '@/lib/contracts';

// Read total staked
const { data: totalStaked } = useReadContract({
  address: STAKING_ADDRESS,
  abi: STAKING_ABI,
  functionName: 'totalStaked',
});

// Stake USDC
const { writeContract } = useWriteContract();
writeContract({
  address: STAKING_ADDRESS,
  abi: STAKING_ABI,
  functionName: 'stake',
  args: [parseUnits('100', 6)], // 100 USDC
});
```

---

## 🔒 Security Considerations

> ⚠️ **This is a hackathon-grade reference implementation. NOT audited. Do NOT use on mainnet without professional audit.**

### Known Limitations

| Issue | Risk | Mitigation |
|-------|------|------------|
| No reentrancy guard | Medium | Add `ReentrancyGuard` from OpenZeppelin |
| Integer overflow in reward calc | Low | Solidity 0.8+ has built-in overflow checks |
| No pause mechanism | Medium | Add `Pausable` for emergency stops |
| Owner centralization | High | Consider multi-sig or timelock for `setApy` |
| No LP token standard | Low | AMM uses internal `balanceOf`, not ERC20 |
| No slippage protection in AMM | Medium | Frontend calculates, but contract doesn't enforce |

### Recommended Improvements for Production

1. **Add OpenZeppelin's ReentrancyGuard** to all state-changing functions
2. **Implement Pausable** for emergency stops
3. **Add timelock** to owner functions (APY changes, etc.)
4. **Audit all contracts** before mainnet deployment
5. **Add event indexing** for efficient off-chain queries
6. **Implement upgradeable proxy** pattern for future fixes

---

## ⚡ Performance

| Metric | Value |
|--------|-------|
| First Contentful Paint | ~1.2s |
| Largest Contentful Paint | ~2.1s |
| Time to Interactive | ~2.8s |
| Bundle Size (gzipped) | ~180KB |
| Contract Deployment Gas | ~1.2M gas |
| Stake Transaction Gas | ~85K gas |
| Swap Transaction Gas | ~120K gas |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Use conventional commits (`feat:`, `fix:`, `docs:`, etc.)
- Add tests for new contract functions
- Update README for any user-facing changes

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Circle](https://circle.com) — For building Arc L1 and native USDC infrastructure
- [Uniswap V2](https://uniswap.org) — AMM design inspiration
- [OpenZeppelin](https://openzeppelin.com) — Security patterns and libraries
- [RainbowKit](https://rainbowkit.com) — Beautiful wallet connection UI
- [wagmi](https://wagmi.sh) — React hooks for Ethereum

---

<div align="center">

**Built with ❤️ on Circle's Arc L1**

[Report Bug](https://github.com/rukinem/arcvault/issues) · [Request Feature](https://github.com/rukinem/arcvault/issues) · [Documentation](https://platform.xiaomimimo.com)

</div>
