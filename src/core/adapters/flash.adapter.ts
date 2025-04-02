import {
  FlashTrade,
  FlashTradesResponseSchema,
} from "@/core/schemas/exchange.schema";
import {
  NormalizedTrade,
  NormalizedTradesResponse,
  TradeAction,
} from "@/core/schemas/trade.schema";
import { FetchOptions, ExchangeAdapter } from "./adapter.interface";
import {
  calculateFeeInUsd,
  getFlashTradePrice,
  getFlashEntryPrice,
  getFlashExitPrice,
} from "@/lib/formatting";
import { MARKETS } from "@/core/domain/markets";

export class FlashAdapter implements ExchangeAdapter {
  readonly name = "Flash";

  async fetchTrades(
    address: string,
    options: FetchOptions = {}
  ): Promise<NormalizedTradesResponse> {
    const { limit, offset } = options;
    const queryParams = new URLSearchParams();

    if (limit) queryParams.set("take", limit.toString());
    if (offset)
      queryParams.set(
        "page",
        Math.floor(offset / (limit || 100) + 1).toString()
      );

    try {
      const response = await fetch(
        `/api/exchanges/flash?address=${address}&${queryParams.toString()}`,
        { next: { revalidate: 300 } }
      );

      if (!response.ok) {
        throw new Error(`Flash API returned ${response.status}`);
      }

      const rawData = await response.json();
      // Validate against schema
      const parsedData = FlashTradesResponseSchema.parse(rawData);

      // Transform to normalized format
      const normalizedTrades = parsedData.map((trade) =>
        this.normalizeFlashTrade(trade)
      );

      return {
        trades: normalizedTrades,
        totalCount: normalizedTrades.length, // Flash API doesn't provide total count
        page: offset ? Math.floor(offset / (limit || 100)) + 1 : 1,
        pageSize: limit || normalizedTrades.length,
        hasMore: false, // We can't know this without additional API calls
      };
    } catch (error) {
      console.error("Error fetching Flash trades:", error);
      throw error;
    }
  }

  async checkAvailability(address: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/wallet-check?address=${address}`, {
        next: { revalidate: 60 },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.availableExchanges.includes("Flash");
    } catch (error) {
      console.error("Error checking Flash availability:", error);
      return false;
    }
  }

  getMarketName(marketId: string): string {
    const marketInfo = MARKETS[marketId];
    return marketInfo ? marketInfo.name : marketId;
  }

  supportsPagination(): boolean {
    return true;
  }

  // Private helper to normalize Flash trades
  private normalizeFlashTrade(trade: FlashTrade): NormalizedTrade {
    const marketInfo = MARKETS[trade.market] || { name: trade.market };

    return {
      id: `flash-${trade.txId}-${trade.eventIndex}`,
      exchange: "Flash",
      timestamp: parseInt(trade.timestamp),
      market: marketInfo.name,
      side: trade.side,
      action: this.mapFlashTradeAction(trade),
      price: getFlashTradePrice(trade),
      entryPrice: trade.entryPrice ? getFlashEntryPrice(trade) : null,
      exitPrice: trade.exitPrice ? getFlashExitPrice(trade) : null,
      sizeUsd: trade.sizeUsd ? parseFloat(trade.sizeUsd) : 0,
      collateralUsd: trade.collateralUsd ? parseFloat(trade.collateralUsd) : 0,
      fee: calculateFeeInUsd(trade),
      pnl: trade.pnlUsd ? parseFloat(trade.pnlUsd) : null,
      txId: trade.txId,
    };
  }

  // Map Flash trade types to our normalized action format using discriminated unions
  private mapFlashTradeAction(trade: FlashTrade): TradeAction {
    switch (trade.tradeType) {
      case "OPEN_POSITION":
        return { type: "open" };
      case "CLOSE_POSITION":
        return {
          type: "close",
          pnl: trade.pnlUsd ? parseFloat(trade.pnlUsd) : null,
        };
      case "INCREASE_SIZE":
        return { type: "increase" };
      case "DECREASE_SIZE":
        return { type: "decrease" };
      case "LIQUIDATE":
        return { type: "liquidate" };
      case "ADD_COLLATERAL":
        return {
          type: "add_collateral",
          amount: trade.collateralAmount
            ? parseFloat(trade.collateralAmount)
            : 0,
        };
      case "REMOVE_COLLATERAL":
        return {
          type: "remove_collateral",
          amount: trade.collateralAmount
            ? parseFloat(trade.collateralAmount)
            : 0,
        };
      case "TAKE_PROFIT":
        return {
          type: "take_profit",
          targetPrice: trade.exitPrice
            ? parseFloat(trade.exitPrice)
            : undefined,
        };
      case "STOP_LOSS":
        return {
          type: "stop_loss",
          triggerPrice: trade.exitPrice
            ? parseFloat(trade.exitPrice)
            : undefined,
        };
      case "OPEN_LIMIT_ORDER_POSITION":
        return {
          type: "open_limit_order",
          limitPrice: trade.orderPrice
            ? parseFloat(trade.orderPrice)
            : undefined,
        };
      default:
        return { type: "unknown" };
    }
  }
}
