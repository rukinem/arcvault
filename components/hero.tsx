"use client";

import { Button } from "./ui/button";
import { ArrowRight, ShieldCheck } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-10 pb-4">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60 shimmer">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          Live on Arc Testnet · Chain ID 5042002 · USDC native
        </div>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
          <span className="text-gradient">Stake USDC,</span>
          <br />
          <span className="text-white">earn yield on Arc.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-balance text-white/60">
          ArcVault is a non-custodial staking vault built on Circle&apos;s Arc
          L1. Deposit native USDC, earn continuous rewards, and pay gas in
          dollars — no second token required.
        </p>
        <div className="mt-7 flex items-center justify-center gap-3">
          <Button size="lg" onClick={() => {
            document.getElementById("pools")?.scrollIntoView({ behavior: "smooth" });
          }}>
            Start staking <ArrowRight className="h-4 w-4" />
          </Button>
          <a
            href="https://faucet.circle.com"
            target="_blank"
            rel="noreferrer"
          >
            <Button size="lg" variant="secondary">
              Get testnet USDC
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
