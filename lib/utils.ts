import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number, digits = 2) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(digits) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(digits) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(digits) + "K";
  return n.toFixed(digits);
}

export function formatUSD(n: number) {
  return "$" + formatNumber(n);
}
