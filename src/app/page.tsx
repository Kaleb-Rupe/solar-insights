"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isValidSolanaAddress } from "@/lib/utils/validation";

export default function Home() {
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setError("");

    // Validate address
    if (!address.trim()) {
      setError("Please enter a wallet address");
      return;
    }

    if (!isValidSolanaAddress(address.trim())) {
      setError("Invalid Solana wallet address format");
      return;
    }

    // Navigate to the address dashboard
    router.push(`/${address.trim()}`);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-center">Solar Insights</h1>
          <p className="mt-2 text-center text-gray-600">
            Track your Solana trading performance across exchanges
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm">
            <div>
              <label htmlFor="wallet-address" className="sr-only">
                Solana Wallet Address
              </label>
              <input
                id="wallet-address"
                name="address"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your Solana wallet address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              View Dashboard
            </button>
          </div>
        </form>

        <div className="text-center text-sm text-gray-500">
          <p>
            Need help? Check out our{" "}
            <a href="#" className="text-blue-600 hover:text-blue-500">
              documentation
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
