"use client";

import { Card, CardTitle } from "./ui/card";
import { ArrowUpRight, Coins, Flame, Wallet } from "lucide-react";
import {
  formatUsdc,
  useStakingStats,
  useUsdcBalance,
  useUserPosition,
} from "@/lib/hooks";

export function StatsCards() {
  const { data: stats } = useStakingStats();
  const { data: balance } = useUsdcBalance();
  const { data: position } = useUserPosition();

  const totalStaked = stats?.[0]?.result as bigint | undefined;
  const apyBps = stats?.[1]?.result as bigint | undefined;
  const apy = apyBps ? Number(apyBps) / 100 : 0;

  const principal = (position?.[0]?.result as
    | readonly [bigint, bigint, bigint]
    | undefined)?.[0];
  const pending = position?.[1]?.result as bigint | undefined;

  const items = [
    {
      label: "Total Value Locked",
      value: `${formatUsdc(totalStaked)} USDC`,
      sub: "Pool TVL",
      icon: Coins,
    },
    {
      label: "Current APY",
      value: `${apy.toFixed(2)}%`,
      sub: "Paid in USDC",
      icon: Flame,
    },
    {
      label: "Your Stake",
      value: `${formatUsdc(principal)} USDC`,
      sub: "Principal locked",
      icon: Wallet,
    },
    {
      label: "Pending Rewards",
      value: `${formatUsdc(pending, 4)} USDC`,
      sub: "Claimable now",
      icon: ArrowUpRight,
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((s) => (
        <Card key={s.label} className="group relative overflow-hidden">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand/20 blur-2xl" />
          <div className="flex items-start justify-between">
            <CardTitle>{s.label}</CardTitle>
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/5 text-brand-400">
              <s.icon className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-semibold tracking-tight text-white">
            {s.value}
          </div>
          <div className="mt-1 text-xs font-medium text-white/40">{s.sub}</div>
        </Card>
      ))}
    </section>
  );
}

export function WalletBalanceHint() {
  const { data: balance } = useUsdcBalance();
  if (balance === undefined) return null;
  return (
    <span className="text-xs text-white/40">
      Wallet: {formatUsdc(balance)} USDC
    </span>
  );
}
