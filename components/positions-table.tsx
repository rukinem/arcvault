"use client";

import { Card, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { TrendingUp, Loader2 } from "lucide-react";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import {
  formatUsdc,
  useStakingStats,
  useUserPosition,
} from "@/lib/hooks";
import { STAKING_ABI, STAKING_ADDRESS } from "@/lib/contracts";
import { useEffect } from "react";

export function PositionsTable() {
  const { isConnected } = useAccount();
  const { data: position, refetch } = useUserPosition();
  const { data: stats } = useStakingStats();

  const apyBps = stats?.[1]?.result as bigint | undefined;
  const apy = apyBps ? Number(apyBps) / 100 : 0;

  const principal = (position?.[0]?.result as
    | readonly [bigint, bigint, bigint]
    | undefined)?.[0];
  const lastUpdate = (position?.[0]?.result as
    | readonly [bigint, bigint, bigint]
    | undefined)?.[2];
  const pending = position?.[1]?.result as bigint | undefined;

  const { writeContractAsync, data: txHash, isPending } = useWriteContract();
  const { isLoading: isMining, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (isSuccess) refetch();
  }, [isSuccess, refetch]);

  async function onClaim() {
    await writeContractAsync({
      address: STAKING_ADDRESS,
      abi: STAKING_ABI,
      functionName: "claim",
    });
  }

  const since = lastUpdate
    ? relTime(Number(lastUpdate) * 1000)
    : "—";
  const busy = isPending || isMining;

  return (
    <Card id="positions">
      <div className="flex items-center justify-between">
        <CardTitle>Your Position</CardTitle>
        {pending !== undefined && pending > 0n && (
          <div className="flex items-center gap-1 text-xs text-emerald-400">
            <TrendingUp className="h-3.5 w-3.5" /> +{formatUsdc(pending, 4)} USDC pending
          </div>
        )}
      </div>

      {!isConnected ? (
        <div className="mt-6 rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center text-sm text-white/40">
          Connect your wallet to view your staking position.
        </div>
      ) : !principal || principal === 0n ? (
        <div className="mt-6 rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center text-sm text-white/40">
          You have no active stake yet. Use the panel above to deposit USDC.
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-white/40">
                <th className="pb-3 font-medium">Pool</th>
                <th className="pb-3 font-medium">Staked</th>
                <th className="pb-3 font-medium">Pending Rewards</th>
                <th className="pb-3 font-medium">APY</th>
                <th className="pb-3 font-medium">Last update</th>
                <th className="pb-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-white/5 text-white/80">
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600" />
                    <span className="font-medium text-white">
                      USDC Core (Arc)
                    </span>
                  </div>
                </td>
                <td className="py-4">{formatUsdc(principal)} USDC</td>
                <td className="py-4 text-emerald-400">
                  +{formatUsdc(pending, 4)}
                </td>
                <td className="py-4">{apy.toFixed(2)}%</td>
                <td className="py-4 text-white/50">{since}</td>
                <td className="py-4">
                  <div className="flex justify-end">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={onClaim}
                      disabled={busy || !pending || pending === 0n}
                    >
                      {busy && <Loader2 className="h-3 w-3 animate-spin" />}
                      Claim
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function relTime(ms: number) {
  const diff = Date.now() - ms;
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
