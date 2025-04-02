"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { FlashAdapter } from "@/core/adapters/flash.adapter";
import { JupiterAdapter } from "@/core/adapters/jupiter.adapter";
import { UserPreferences } from "@/core/schemas/trader.schema";
import { NormalizedTrade } from "@/core/schemas/trade.schema";
import { FetchOptions } from "@/core/adapters/adapter.interface";

// Create adapter instances
const flashAdapter = new FlashAdapter();
const jupiterAdapter = new JupiterAdapter();

export function useTrades(
  address: string,
  preferences: UserPreferences,
  options: FetchOptions = {}
) {
  const [isRefetching, setIsRefetching] = useState(false);

  // Query for Flash trades
  const flashQuery = useQuery({
    queryKey: ["trades", "flash", address, options],
    queryFn: async () => {
      if (!preferences.exchanges.Flash) {
        return { trades: [], totalCount: 0 };
      }
      return flashAdapter.fetchTrades(address, options);
    },
    enabled: !!address && preferences.exchanges.Flash,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Query for Jupiter trades
  const jupiterQuery = useQuery({
    queryKey: ["trades", "jupiter", address, options],
    queryFn: async () => {
      if (!preferences.exchanges.Jupiter) {
        return { trades: [], totalCount: 0 };
      }
      return jupiterAdapter.fetchTrades(address, options);
    },
    enabled: !!address && preferences.exchanges.Jupiter,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Combine all trades and sort by timestamp
  const allTrades: NormalizedTrade[] = [
    ...(flashQuery.data?.trades || []),
    ...(jupiterQuery.data?.trades || []),
  ].sort((a, b) => b.timestamp - a.timestamp);

  const totalCount =
    (flashQuery.data?.totalCount || 0) + (jupiterQuery.data?.totalCount || 0);

  // Function to refetch all data
  const refetch = async () => {
    setIsRefetching(true);
    try {
      await Promise.all([
        preferences.exchanges.Flash && flashQuery.refetch(),
        preferences.exchanges.Jupiter && jupiterQuery.refetch(),
      ]);
    } finally {
      setIsRefetching(false);
    }
  };

  return {
    trades: allTrades,
    totalCount,
    isLoading: flashQuery.isLoading || jupiterQuery.isLoading,
    isRefetching:
      isRefetching || flashQuery.isRefetching || jupiterQuery.isRefetching,
    isError: flashQuery.isError || jupiterQuery.isError,
    error: flashQuery.error || jupiterQuery.error,
    refetch,
  };
}
