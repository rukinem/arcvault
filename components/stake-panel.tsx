"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Lock,
  Zap,
  ShieldCheck,
  Loader2,
  Check,
  ExternalLink,
} from "lucide-react";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { parseUnits } from "viem";
import {
  ERC20_ABI,
  STAKING_ABI,
  STAKING_ADDRESS,
  USDC_ADDRESS,
  USDC_DECIMALS,
} from "@/lib/contracts";
import {
  formatUsdc,
  useAllowance,
  useStakingStats,
  useUsdcBalance,
  useUserPosition,
} from "@/lib/hooks";

type Mode = "stake" | "unstake";

export function StakePanel() {
  const { isConnected } = useAccount();
  const [mode, setMode] = useState<Mode>("stake");
  const [amount, setAmount] = useState("");
  const [pct, setPct] = useState<number | null>(null);

  const { data: balanceRaw } = useUsdcBalance();
  const { data: allowanceRaw, refetch: refetchAllowance } = useAllowance();
  const { data: stats } = useStakingStats();
  const { data: position, refetch: refetchPosition } = useUserPosition();

  const apyBps = stats?.[1]?.result as bigint | undefined;
  const apy = apyBps ? Number(apyBps) / 100 : 7.84;

  const principal = (position?.[0]?.result as
    | readonly [bigint, bigint, bigint]
    | undefined)?.[0];

  const balance = balanceRaw ?? 0n;
  const allowance = allowanceRaw ?? 0n;

  const amountWei = useMemo(() => {
    if (!amount) return 0n;
    try {
      return parseUnits(amount, USDC_DECIMALS);
    } catch {
      return 0n;
    }
  }, [amount]);

  const needsApprove = mode === "stake" && amountWei > 0n && allowance < amountWei;

  const estRewards = useMemo(() => {
    const a = parseFloat(amount) || 0;
    return (a * (apy / 100)).toFixed(2);
  }, [amount, apy]);

  const { writeContractAsync, data: txHash, isPending, reset } =
    useWriteContract();
  const { isLoading: isMining, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Refresh chain reads after a successful tx
  useEffect(() => {
    if (isSuccess) {
      refetchAllowance();
      refetchPosition();
      const t = setTimeout(() => reset(), 2500);
      return () => clearTimeout(t);
    }
  }, [isSuccess, refetchAllowance, refetchPosition, reset]);

  function setPercent(p: number) {
    setPct(p);
    const src =
      mode === "stake"
        ? balance
        : (principal ?? 0n);
    const v = (src * BigInt(p)) / 100n;
    setAmount(formatUsdc(v, 4).replace(/,/g, ""));
  }

  async function onApprove() {
    await writeContractAsync({
      address: USDC_ADDRESS,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [STAKING_ADDRESS, amountWei],
    });
  }

  async function onStake() {
    await writeContractAsync({
      address: STAKING_ADDRESS,
      abi: STAKING_ABI,
      functionName: "stake",
      args: [amountWei],
    });
  }

  async function onUnstake() {
    await writeContractAsync({
      address: STAKING_ADDRESS,
      abi: STAKING_ABI,
      functionName: "unstake",
      args: [amountWei],
    });
  }

  async function onAction() {
    if (!isConnected || !amountWei) return;
    if (mode === "stake") {
      if (needsApprove) await onApprove();
      else await onStake();
    } else {
      await onUnstake();
    }
  }

  const busy = isPending || isMining;
  const label = (() => {
    if (!isConnected) return "Connect wallet to continue";
    if (!amount) return mode === "stake" ? "Enter amount to stake" : "Enter amount to unstake";
    if (busy) return isPending ? "Confirm in wallet..." : "Mining transaction...";
    if (isSuccess) return "Transaction confirmed";
    if (mode === "stake")
      return needsApprove ? `Approve ${amount} USDC` : `Stake ${amount} USDC`;
    return `Unstake ${amount} USDC`;
  })();

  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-400/30 to-violet-600/20 opacity-60 blur-2xl" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Stake USDC on Arc</CardTitle>
            <div className="mt-1 text-xs text-white/40">
              Native USDC · {apy.toFixed(2)}% APY · paid in USDC
            </div>
          </div>
          <div className="flex rounded-xl bg-black/40 p-1">
            {(["stake", "unstake"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setAmount("");
                  setPct(null);
                }}
                className={`rounded-lg px-4 py-1.5 text-xs font-semibold capitalize transition ${
                  mode === m
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:text-white"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div className="mt-5 rounded-2xl border border-white/5 bg-black/30 p-4">
          <div className="flex items-center justify-between text-xs text-white/40">
            <span>Amount</span>
            <span>
              {mode === "stake"
                ? `Wallet: ${formatUsdc(balance)} USDC`
                : `Staked: ${formatUsdc(principal)} USDC`}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between gap-3">
            <Input
              placeholder="0.00"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setPct(null);
              }}
              inputMode="decimal"
            />
            <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
              <div className="h-5 w-5 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600" />
              <span className="text-sm font-medium text-white">USDC</span>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            {[25, 50, 75, 100].map((p) => (
              <button
                key={p}
                onClick={() => setPercent(p)}
                className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition ${
                  pct === p
                    ? "bg-brand text-white"
                    : "bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                {p === 100 ? "MAX" : `${p}%`}
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="mt-4 space-y-2 rounded-2xl border border-white/5 bg-black/20 p-4 text-sm">
          <Row
            icon={<Zap className="h-3.5 w-3.5" />}
            label="Est. yearly rewards"
            value={`${estRewards} USDC`}
          />
          <Row
            icon={<Lock className="h-3.5 w-3.5" />}
            label="Lock period"
            value="Flexible"
          />
          <Row
            icon={<ShieldCheck className="h-3.5 w-3.5" />}
            label="Network"
            value="Arc Testnet · USDC native"
          />
        </div>

        <Button
          onClick={onAction}
          size="lg"
          className="mt-5 w-full"
          disabled={!isConnected || busy || !amountWei}
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSuccess && !busy && <Check className="h-4 w-4" />}
          {label}
        </Button>

        {txHash && (
          <a
            href={`https://explorer.testnet.arc.network/tx/${txHash}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 flex items-center justify-center gap-1 text-xs text-white/50 hover:text-white"
          >
            View transaction <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </Card>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-white/50">
        {icon}
        {label}
      </span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}
