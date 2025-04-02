import { NormalizedTrade } from "@/core/schemas/trade.schema";

// Domain methods for working with trade data
export class TradeAnalytics {
  constructor(private trades: NormalizedTrade[]) {}

  public getTotalPnl(): number {
    return this.trades.reduce((sum, trade) => {
      // Using discriminated unions for type safety
      if (trade.action.type === "close" || trade.action.type === "liquidate") {
        return sum + (trade.pnl || 0);
      }
      return sum;
    }, 0);
  }

  public getWinRate(): number {
    const closedTrades = this.trades.filter(
      (trade) =>
        trade.action.type === "close" ||
        trade.action.type === "take_profit" ||
        trade.action.type === "stop_loss"
    );

    if (closedTrades.length === 0) return 0;

    const winningTrades = closedTrades.filter((trade) => (trade.pnl || 0) > 0);
    return winningTrades.length / closedTrades.length;
  }

  public getVolumeByMarket(): Record<string, number> {
    return this.trades.reduce((acc, trade) => {
      const market = trade.market;
      acc[market] = (acc[market] || 0) + trade.sizeUsd;
      return acc;
    }, {} as Record<string, number>);
  }

  // More analytical methods...
}

export function groupTradesByExchange(
  trades: NormalizedTrade[]
): Record<string, NormalizedTrade[]> {
  return trades.reduce((grouped, trade) => {
    const exchange = trade.exchange;
    if (!grouped[exchange]) {
      grouped[exchange] = [];
    }
    grouped[exchange].push(trade);
    return grouped;
  }, {} as Record<string, NormalizedTrade[]>);
}
