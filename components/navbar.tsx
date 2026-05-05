"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Sparkles } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-black/30 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand to-accent">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">
            ArcVault
          </span>
          <span className="ml-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] uppercase tracking-widest text-emerald-300">
            Arc Testnet
          </span>
        </div>

        <nav className="hidden items-center gap-8 text-sm text-white/60 md:flex">
          <a className="hover:text-white" href="#trade">
            Stake
          </a>
          <a className="hover:text-white" href="#trade">
            Swap
          </a>
          <a className="hover:text-white" href="#pools">
            Pools
          </a>
          <a className="hover:text-white" href="#positions">
            Positions
          </a>
        </nav>

        <ConnectButton
          chainStatus="icon"
          accountStatus="address"
          showBalance={false}
        />
      </div>
    </header>
  );
}
