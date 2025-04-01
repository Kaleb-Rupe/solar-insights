import { FlashTrade } from "@/core/schemas";
import { MARKETS } from "@/core/markets";
import { calculateFeeInUsd, mapFlashTradeAction } from "@/lib/formatting";
import { NormalizedTrade } from "@/types/types";

export function normalizeFlashTrade(trade: FlashTrade): NormalizedTrade {
  const marketInfo = MARKETS[trade.market] || { name: trade.market };

  return {
    exchange: "Flash",
    timestamp: parseInt(trade.timestamp),
    market: marketInfo.name,
    side: trade.side,
    action: mapFlashTradeAction(trade.tradeType),
    price: trade.price
      ? parseFloat(trade.price)
      : trade.exitPrice
      ? parseFloat(trade.exitPrice)
      : 0,
    sizeUsd: trade.sizeUsd ? parseFloat(trade.sizeUsd) : 0,
    collateralUsd: trade.collateralUsd ? parseFloat(trade.collateralUsd) : 0,
    fee: calculateFeeInUsd(trade),
    pnl: trade.pnlUsd ? parseFloat(trade.pnlUsd) : null,
    txId: trade.txId,
  };
}
