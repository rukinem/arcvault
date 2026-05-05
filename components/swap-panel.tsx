"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  ArrowDownUp,
  Check,
  Droplets,
  ExternalLink,
  Loader2,
  Settings2,
  Sparkles,
} from "lucide-react";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { parseUnits } from "viem";
import {
  AMM_ABI,
  AMM_ADDRESS,
  ERC20_ABI,
  EURC_ABI,
  EURC_ADDRESS,
  USDC_ADDRESS,
  USDC_DECIMALS,
} from "@/lib/contracts";
import {
  formatUsdc,
  useAmmAllowance,
  useAmmReserves,
  useEurcBalance,
  useUsdcBalance,
} from "@/lib/hooks";

type Token = "USDC" | "EURC";

const TOKEN_META: Record<
  Token,
  { address: `0x${string}`; gradient: string; symbol: Token }
> = {
  USDC: {
    address: USDC_ADDRESS,
    gradient: "from-cyan-400 to-blue-600",
    symbol: "USDC",
  },
  EURC: {
    address: EURC_ADDRESS,
    gradient: "from-amber-300 to-yellow-600",
    symbol: "EURC",
  },
};

export function SwapPanel() {
  const { isConnected } = useAccount();

  const [tokenIn, setTokenIn] = useState<Token>("USDC");
  const [amountIn, setAmountIn] = useState("");
  const [slippageBps, setSlippageBps] = useState(50); // 0.5%
  const [showSettings, setShowSettings] = useState(false);

  const tokenOut: Token = tokenIn === "USDC" ? "EURC" : "USDC";

  const { data: usdcBal } = useUsdcBalance();
  const { data: eurcBal } = useEurcBalance();
  const { data: reserves } = useAmmReserves();
  const inAddr = TOKEN_META[tokenIn].address;
  const { data: allowance, refetch: refetchAllowance } = useAmmAllowance(inAddr);

  // reserves: [reserve0 (USDC), reserve1 (EURC), ts]
  const [r0, r1] = (reserves as
    | readonly [bigint, bigint, number]
    | undefined) ?? [0n, 0n, 0];

  const reserveIn = tokenIn === "USDC" ? r0 : r1;
  const reserveOut = tokenIn === "USDC" ? r1 : r0;

  const amountInWei = useMemo(() => {
    if (!amountIn) return 0n;
    try {
      return parseUnits(amountIn, USDC_DECIMALS);
    } catch {
      return 0n;
    }
  }, [amountIn]);

  // Local quote using x*y=k with 0.3% fee — same math as on-chain
  const quote = useMemo(() => {
    if (amountInWei === 0n || reserveIn === 0n || reserveOut === 0n) return 0n;
    const fee = 997n;
    const num = amountInWei * fee * reserveOut;
    const den = reserveIn * 1000n + amountInWei * fee;
    return num / den;
  }, [amountInWei, reserveIn, reserveOut]);

  const minOut = (quote * BigInt(10_000 - slippageBps)) / 10_000n;

  const balanceIn = tokenIn === "USDC" ? usdcBal : eurcBal;
  const balanceOut = tokenOut === "USDC" ? usdcBal : eurcBal;

  const needsApprove =
    isConnected && amountInWei > 0n && (allowance ?? 0n) < amountInWei;

  // Spot price (price impact display)
  const spotPrice =
    reserveIn > 0n && reserveOut > 0n
      ? Number(reserveOut) / Number(reserveIn)
      : 0;
  const execPrice =
    amountInWei > 0n ? Number(quote) / Number(amountInWei) : spotPrice;
  const priceImpact = spotPrice
    ? ((spotPrice - execPrice) / spotPrice) * 100
    : 0;

  const { writeContractAsync, data: txHash, isPending, reset } =
    useWriteContract();
  const { isLoading: isMining, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (isSuccess) {
      refetchAllowance();
      const t = setTimeout(() => reset(), 2500);
      return () => clearTimeout(t);
    }
  }, [isSuccess, refetchAllowance, reset]);

  function flip() {
    setTokenIn(tokenOut);
    setAmountIn("");
  }

  async function onApprove() {
    await writeContractAsync({
      address: inAddr,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [AMM_ADDRESS, amountInWei],
    });
  }

  async function onSwap() {
    await writeContractAsync({
      address: AMM_ADDRESS,
      abi: AMM_ABI,
      functionName: "swap",
      args: [inAddr, amountInWei, minOut],
    });
  }

  async function onMintEurc() {
    await writeContractAsync({
      address: EURC_ADDRESS,
      abi: EURC_ABI,
      functionName: "faucet",
      args: [parseUnits("100", 6)],
    });
  }

  async function onAction() {
    if (!isConnected || !amountInWei) return;
    if (needsApprove) await onApprove();
    else await onSwap();
  }

  const busy = isPending || isMining;
  const label = (() => {
    if (!isConnected) return "Connect wallet to continue";
    if (!amountIn) return `Enter ${tokenIn} amount`;
    if (busy) return isPending ? "Confirm in wallet..." : "Mining...";
    if (isSuccess) return "Transaction confirmed";
    return needsApprove
      ? `Approve ${amountIn} ${tokenIn}`
      : `Swap ${amountIn} ${tokenIn} → ${tokenOut}`;
  })();

  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-300/20 via-transparent to-cyan-400/20 opacity-60 blur-2xl" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Swap</CardTitle>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-white/40">
              <Sparkles className="h-3 w-3 text-amber-300" />
              USDC ↔ EURC · 0.30% fee · powered by ArcVault AMM
            </div>
          </div>
          <button
            onClick={() => setShowSettings((s) => !s)}
            className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
          >
            <Settings2 className="h-4 w-4" />
          </button>
        </div>

        {showSettings && (
          <div className="mt-4 rounded-2xl border border-white/5 bg-black/30 p-4">
            <div className="text-xs text-white/40">Slippage tolerance</div>
            <div className="mt-2 flex gap-2">
              {[10, 50, 100, 300].map((bps) => (
                <button
                  key={bps}
                  onClick={() => setSlippageBps(bps)}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition ${
                    slippageBps === bps
                      ? "bg-brand text-white"
                      : "bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
                >
                  {bps / 100}%
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Token in */}
        <div className="mt-5 rounded-2xl border border-white/5 bg-black/30 p-4">
          <div className="flex items-center justify-between text-xs text-white/40">
            <span>From</span>
            <button
              onClick={() => {
                if (balanceIn) setAmountIn(formatUsdc(balanceIn, 4).replace(/,/g, ""));
              }}
              className="hover:text-white"
            >
              Balance: {formatUsdc(balanceIn, 4)} {tokenIn}
            </button>
          </div>
          <div className="mt-1 flex items-center gap-3">
            <Input
              placeholder="0.00"
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
              inputMode="decimal"
            />
            <TokenChip token={tokenIn} />
          </div>
        </div>

        {/* Flip */}
        <div className="relative my-2 flex justify-center">
          <button
            onClick={flip}
            className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-black/60 text-white/70 transition hover:rotate-180 hover:text-white"
          >
            <ArrowDownUp className="h-4 w-4" />
          </button>
        </div>

        {/* Token out */}
        <div className="rounded-2xl border border-white/5 bg-black/30 p-4">
          <div className="flex items-center justify-between text-xs text-white/40">
            <span>To (estimated)</span>
            <span>
              Balance: {formatUsdc(balanceOut, 4)} {tokenOut}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-3">
            <div className="flex-1 truncate text-3xl font-medium tracking-tight text-white">
              {quote === 0n ? "0.00" : formatUsdc(quote, 4)}
            </div>
            <TokenChip token={tokenOut} />
          </div>
        </div>

        {/* Summary */}
        <div className="mt-4 space-y-1.5 rounded-2xl border border-white/5 bg-black/20 p-4 text-sm">
          <Row
            label="Rate"
            value={
              spotPrice
                ? `1 ${tokenIn} ≈ ${spotPrice.toFixed(4)} ${tokenOut}`
                : "—"
            }
          />
          <Row
            label="Price impact"
            value={`${priceImpact.toFixed(2)}%`}
            tone={
              Math.abs(priceImpact) > 5
                ? "danger"
                : Math.abs(priceImpact) > 1
                ? "warn"
                : "ok"
            }
          />
          <Row
            label="Min received"
            value={`${formatUsdc(minOut, 4)} ${tokenOut}`}
          />
          <Row
            label="Pool reserves"
            value={`${formatUsdc(r0, 0)} USDC / ${formatUsdc(r1, 0)} EURC`}
          />
        </div>

        <Button
          onClick={onAction}
          size="lg"
          className="mt-5 w-full"
          disabled={!isConnected || busy || !amountInWei || quote === 0n}
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSuccess && !busy && <Check className="h-4 w-4" />}
          {label}
        </Button>

        {/* Faucet helper */}
        <div className="mt-3 flex items-center justify-between text-xs text-white/40">
          <button
            onClick={onMintEurc}
            disabled={busy}
            className="flex items-center gap-1.5 text-amber-300 hover:text-amber-200 disabled:opacity-50"
          >
            <Droplets className="h-3 w-3" />
            Mint 100 EURC (testnet faucet)
          </button>
          {txHash && (
            <a
              href={`https://explorer.testnet.arc.network/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-white"
            >
              View tx <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </Card>
  );
}

function TokenChip({ token }: { token: Token }) {
  const meta = TOKEN_META[token];
  return (
    <div className="flex shrink-0 items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
      <div
        className={`h-5 w-5 rounded-full bg-gradient-to-br ${meta.gradient}`}
      />
      <span className="text-sm font-medium text-white">{meta.symbol}</span>
    </div>
  );
}

function Row({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "ok" | "warn" | "danger";
}) {
  const toneClass =
    tone === "danger"
      ? "text-rose-400"
      : tone === "warn"
      ? "text-amber-300"
      : tone === "ok"
      ? "text-emerald-400"
      : "text-white";
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/50">{label}</span>
      <span className={`font-medium ${toneClass}`}>{value}</span>
    </div>
  );
}
