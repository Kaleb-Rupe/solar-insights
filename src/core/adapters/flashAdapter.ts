import { checkFlashDataAvailability } from "@/lib/api/flashApi";
import { fetchFlashHistory } from "@/lib/api/flashApi";
import { FetchOptions, NormalizedTrade } from "@/types/types";
import { ExchangeAdapter } from "./exchangeAdapter";

// @/core/adapters/flashAdapter.ts
export class FlashAdapter implements ExchangeAdapter {
  async fetchTrades(
    address: string,
    options: FetchOptions
  ): Promise<NormalizedTrade[]> {
    // Reuse logic from fetchFlashHistory
    const rawData = await fetchFlashHistory(address, options);
    return normalizeFlashData(rawData);
  }
  async checkAvailability(address: string): Promise<boolean> {
    // Reuse logic from checkFlashDataAvailability
    return checkFlashDataAvailability(address);
  }
}
