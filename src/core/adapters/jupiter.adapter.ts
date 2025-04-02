import {
  JupiterTrade,
  JupiterTradesResponseSchema,
} from "@/core/schemas/exchange.schema";
import {
  NormalizedTrade,
  NormalizedTradesResponse,
  TradeAction,
} from "@/core/schemas/trade.schema";
import { FetchOptions, ExchangeAdapter } from "./adapter.interface";
import { formatCurrency, normalizePositionName, getJupiterEntryPrice, getJupiterExitPrice } from "@/lib/formatting";
import { MARKETS } from "../domain/markets";

export class JupiterAdapter implements ExchangeAdapter {
  readonly name = "Jupiter";

  async fetchTrades(
    address: string,
    options: FetchOptions = {}
  ): Promise<NormalizedTradesResponse> {
    const { limit = 100, offset = 0 } = options;

    try {
      const response = await fetch(
        `/api/exchanges/jupiter?address=${address}&start=${offset}&end=${
          offset + limit
        }`,
        { next: { revalidate: 300 } }
      );

      if (!response.ok) {
        throw new Error(`Jupiter API returned ${response.status}`);
      }

      const rawData = await response.json();
      // Validate response against schema
      const parsedData = JupiterTradesResponseSchema.parse(rawData);

      // Transform to normalized format
      const normalizedTrades = parsedData.dataList.map((trade) =>
        this.normalizeJupiterTrade(trade)
      );

      return {
        trades: normalizedTrades,
        totalCount: parsedData.count,
        page: Math.floor(offset / limit) + 1,
        pageSize: limit,
        hasMore: offset + limit < parsedData.count,
      };
    } catch (error) {
      console.error("Error fetching Jupiter trades:", error);
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
      return data.availableExchanges.includes("Jupiter");
    } catch (error) {
      console.error("Error checking Jupiter availability:", error);
      return false;
    }
  }

  getMarketName(marketId: string): string {
    const marketInfo = MARKETS[marketId];
    if (marketInfo) {
      return marketInfo.name;
    }
    // For Jupiter markets or unknown markets, use the raw ID or format it
    return marketId.slice(0, 6) + "..." + marketId.slice(-4);
  }

  supportsPagination(): boolean {
    return true;
  }

  // Private helper to normalize Jupiter trades
  private normalizeJupiterTrade(trade: JupiterTrade): NormalizedTrade {
    const normalizedAction = this.mapJupiterTradeType(trade);
    const normalizedMarket = normalizePositionName(
      trade.positionName,
      trade.side
    );

    return {
      id: `jupiter-${trade.txHash}-${trade.createdTime}`,
      exchange: "Jupiter",
      timestamp: trade.createdTime,
      market: normalizedMarket,
      side: trade.side,
      action: normalizedAction,
      price: formatCurrency(Number(trade.price)),
      entryPrice: getJupiterEntryPrice(trade),
      exitPrice: getJupiterExitPrice(trade),
      sizeUsd: parseFloat(trade.size),
      collateralUsd: parseFloat(trade.collateralUsdDelta),
      fee: trade.fee,
      pnl: trade.pnl ? parseFloat(trade.pnl) : null,
      txId: trade.txHash,
    };
  }

  // Map Jupiter trade types to our normalized action format
  private mapJupiterTradeType(trade: JupiterTrade): TradeAction {
    const { action, orderType, pnl } = trade;

    if (orderType === "Liquidation") {
      return { type: "liquidate" };
    }

    if (orderType === "Market") {
      if (action === "Increase") {
        return { type: "open" };
      }
      if (action === "Decrease") {
        return {
          type: "close",
          pnl: pnl ? parseFloat(pnl) : null,
        };
      }
    }

    if (orderType === "Trigger") {
      const pnlValue = pnl ? parseFloat(pnl) : 0;
      if (pnlValue < 0) {
        return {
          type: "stop_loss",
          triggerPrice: parseFloat(trade.price),
        };
      }
      if (pnlValue > 0) {
        return {
          type: "take_profit",
          targetPrice: parseFloat(trade.price),
        };
      }
      return {
        type: "close",
        pnl: pnlValue,
      };
    }

    return { type: "unknown" };
  }
}
