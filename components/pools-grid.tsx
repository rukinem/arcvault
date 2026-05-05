"use client";

import { Card } from "./ui/card";
import { ShieldCheck, Zap, Layers } from "lucide-react";
import { formatUsdc, useStakingStats } from "@/lib/hooks";

export function PoolsGrid() {
  const { data: stats } = useStakingStats();
  const totalStaked = stats?.[0]?.result as bigint | undefined;
  const apyBps = stats?.[1]?.result as bigint | undefined;
  const apy = apyBps ? Number(apyBps) / 100 : 0;

  const features = [
    {
      icon: Zap,
      title: "USDC-native gas",
      body:
        "On Arc, gas is paid in USDC at ~$0.009 per tx. No second token to manage.",
    },
    {
      icon: ShieldCheck,
      title: "Non-custodial vault",
      body:
        "Your principal sits in an open-source contract. Withdraw anytime — no lock period.",
    },
    {
      icon: Layers,
      title: "Sub-second finality",
      body:
        "Malachite consensus settles your stake/unstake in under a second on Arc L1.",
    },
  ];

  return (
    <section id="pools" className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">USDC Core Pool</h2>
          <p className="text-sm text-white/50">
            One vault. Native USDC. Live on Arc Testnet.
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-white/40">TVL</div>
          <div className="text-lg font-semibold text-white">
            {formatUsdc(totalStaked)} USDC
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {features.map((f) => (
          <Card key={f.title} className="group relative overflow-hidden">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-cyan-400/30 to-violet-600/20 blur-3xl" />
            <div className="relative">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand to-accent">
                <f.icon className="h-4 w-4 text-white" />
              </div>
              <div className="mt-4 font-semibold text-white">{f.title}</div>
              <p className="mt-1 text-sm text-white/50">{f.body}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-gradient-to-br from-cyan-400/30 to-violet-600/30 blur-3xl" />
        <div className="relative grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <div className="text-xs text-white/40">Current APY</div>
            <div className="mt-1 bg-gradient-to-r from-white to-brand-400 bg-clip-text text-4xl font-semibold text-transparent">
              {apy.toFixed(2)}%
            </div>
          </div>
          <div>
            <div className="text-xs text-white/40">Total Staked</div>
            <div className="mt-1 text-3xl font-semibold text-white">
              {formatUsdc(totalStaked)}{" "}
              <span className="text-base text-white/50">USDC</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-white/40">Network</div>
            <div className="mt-1 text-xl font-semibold text-white">
              Arc Testnet
            </div>
            <div className="text-xs text-white/40">Chain ID 5042002</div>
          </div>
        </div>
      </Card>
    </section>
  );
}
