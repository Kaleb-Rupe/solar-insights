import { NormalizedTradesResponse } from "@/core/schemas/trade.schema";

export interface FetchOptions {
  limit?: number;
  offset?: number;
  startTime?: number;
  endTime?: number;
}

export interface ExchangeAdapter {
  readonly name: string;

  // Main data fetching methods
  fetchTrades(
    address: string,
    options?: FetchOptions
  ): Promise<NormalizedTradesResponse>;
  checkAvailability(address: string): Promise<boolean>;

  // Helper methods
  getMarketName(marketId: string): string;
  supportsPagination(): boolean;
}
