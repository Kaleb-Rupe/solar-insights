// src/app/layout.tsx
import { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";

// Initialize font
const inter = Inter({ subsets: ["latin"] });

// Static metadata
export const metadata: Metadata = {
  title: {
    template: "%s | Solar Insights",
    default: "Solar Insights - Solana Trading Analytics",
  },
  description: "Track your Solana trading performance across exchanges",
  keywords: ["solana", "trading", "analytics", "flash", "jupiter", "crypto"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
