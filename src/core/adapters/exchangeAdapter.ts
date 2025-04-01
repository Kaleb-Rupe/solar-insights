import { FetchOptions, NormalizedTrade } from "@/types/types";

// @/core/adapters/exchangeAdapter.ts
export interface ExchangeAdapter {
  fetchTrades(
    address: string,
    options: FetchOptions
  ): Promise<NormalizedTrade[]>;
  checkAvailability(address: string): Promise<boolean>;
}
