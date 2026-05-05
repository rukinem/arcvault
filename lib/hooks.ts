"use client";

import { useAccount, useReadContract, useReadContracts } from "wagmi";
import {
  AMM_ABI,
  AMM_ADDRESS,
  ERC20_ABI,
  EURC_ADDRESS,
  STAKING_ABI,
  STAKING_ADDRESS,
  USDC_ADDRESS,
  USDC_DECIMALS,
} from "./contracts";
import { formatUnits } from "viem";

export function useUsdcBalance() {
  const { address } = useAccount();
  return useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 20_000, staleTime: 10_000 },
  });
}

export function useAllowance() {
  const { address } = useAccount();
  return useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, STAKING_ADDRESS] : undefined,
    query: { enabled: !!address, refetchInterval: 20_000, staleTime: 10_000 },
  });
}

export function useStakingStats() {
  return useReadContracts({
    contracts: [
      {
        address: STAKING_ADDRESS,
        abi: STAKING_ABI,
        functionName: "totalStaked",
      },
      {
        address: STAKING_ADDRESS,
        abi: STAKING_ABI,
        functionName: "apyBps",
      },
    ],
    query: { refetchInterval: 30_000, staleTime: 20_000 },
  });
}

export function useUserPosition() {
  const { address } = useAccount();
  return useReadContracts({
    contracts: [
      {
        address: STAKING_ADDRESS,
        abi: STAKING_ABI,
        functionName: "positions",
        args: address ? [address] : undefined,
      },
      {
        address: STAKING_ADDRESS,
        abi: STAKING_ABI,
        functionName: "pendingRewards",
        args: address ? [address] : undefined,
      },
    ],
    query: { enabled: !!address, refetchInterval: 15_000, staleTime: 8_000 },
  });
}

export function useEurcBalance() {
  const { address } = useAccount();
  return useReadContract({
    address: EURC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 20_000, staleTime: 10_000 },
  });
}

export function useAmmReserves() {
  return useReadContract({
    address: AMM_ADDRESS,
    abi: AMM_ABI,
    functionName: "getReserves",
    query: { refetchInterval: 15_000, staleTime: 8_000 },
  });
}

export function useAmmAllowance(token: `0x${string}`) {
  const { address } = useAccount();
  return useReadContract({
    address: token,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, AMM_ADDRESS] : undefined,
    query: { enabled: !!address, refetchInterval: 20_000, staleTime: 10_000 },
  });
}

export function formatUsdc(value: bigint | undefined, digits = 2): string {
  if (value === undefined) return "0.00";
  const n = Number(formatUnits(value, USDC_DECIMALS));
  return n.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}
