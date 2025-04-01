import { checkJupiterDataAvailability, fetchAllJupiterTradeHistory } from "@/lib/api/jupiterApi";
import { FetchOptions, NormalizedTrade } from "@/types/types";
import { ExchangeAdapter } from "./exchangeAdapter";

// @/core/adapters/jupiterAdapter.ts
export class JupiterAdapter implements ExchangeAdapter {
  async fetchTrades(
    address: string,
    options: FetchOptions
  ): Promise<NormalizedTrade[]> {
    const rawData = await fetchAllJupiterTradeHistory(address, options);
    return normalizeJupiterData(rawData);
  }
  async checkAvailability(address: string): Promise<boolean> {
    return checkJupiterDataAvailability(address);
  }
}
