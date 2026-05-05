import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { StatsCards } from "@/components/stats-cards";
import { ApyChart } from "@/components/apy-chart";
import { StakePanel } from "@/components/stake-panel";
import { SwapPanel } from "@/components/swap-panel";
import { PoolsGrid } from "@/components/pools-grid";
import { PositionsTable } from "@/components/positions-table";

export default function Page() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 pb-24">
        <Hero />

        <div className="mt-8 space-y-8">
          <StatsCards />

          <ApyChart />

          <div
            id="trade"
            className="grid grid-cols-1 gap-6 lg:grid-cols-2"
          >
            <StakePanel />
            <SwapPanel />
          </div>

          <PoolsGrid />

          <PositionsTable />
        </div>

        <footer className="mt-16 border-t border-white/5 pt-8 text-center text-xs text-white/30">
          © {new Date().getFullYear()} ArcVault · Built on Circle&apos;s Arc L1
        </footer>
      </main>
    </>
  );
}
