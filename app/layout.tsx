import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "ArcVault — Stake USDC, Earn on Arc",
  description: "Non-custodial USDC staking vault on Circle's Arc L1. Deposit native USDC, earn continuous rewards, pay gas in dollars.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">
        <div className="aurora" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
