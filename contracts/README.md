# Contracts — USDCStaking on Arc Testnet

Simple linear-APY staking vault. Users stake native USDC (Arc system token at
`0x3600000000000000000000000000000000000000`) and accrue rewards continuously.

## Setup (Foundry)

Install Foundry: https://book.getfoundry.sh/getting-started/installation

```bash
# from this contracts/ folder
forge install foundry-rs/forge-std --no-commit
forge build
```

## Deploy to Arc testnet

1. Generate/import a wallet and fund it via https://faucet.circle.com (Arc Testnet).
   You need USDC for gas (Arc uses USDC as native gas) and for reward funding.

2. Export your private key:
   ```bash
   export PRIVATE_KEY=0x...
   ```

3. Deploy:
   ```bash
   forge script script/Deploy.s.sol:Deploy \
     --rpc-url arc_testnet \
     --private-key $PRIVATE_KEY \
     --broadcast
   ```

4. Copy the deployed address and put it in the frontend `.env.local`:
   ```
   NEXT_PUBLIC_STAKING_ADDRESS=0xYourDeployedAddress
   ```

5. Fund the reward pool (send some USDC directly to the staking contract so it
   can pay out accrued rewards):
   ```bash
   cast send 0x3600000000000000000000000000000000000000 \
     "transfer(address,uint256)" 0xYourStakingAddress 100000000 \
     --rpc-url arc_testnet --private-key $PRIVATE_KEY
   ```
   (100000000 = 100 USDC with 6 decimals)

## Functions

| Function | Description |
|---|---|
| `stake(uint256 amount)` | Pulls USDC via `transferFrom`. Requires prior `approve`. |
| `unstake(uint256 amount)` | Withdraws principal + all accrued rewards. |
| `claim()` | Harvests rewards without touching principal. |
| `pendingRewards(address)` | View current accrued rewards. |
| `positions(address)` | Returns `(principal, rewardDebt, lastUpdate)`. |
| `setApy(uint256 bps)` | Owner-only. 784 = 7.84%. |
