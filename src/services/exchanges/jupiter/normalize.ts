import { JupiterTrade } from "@/core/schemas";
import { mapJupiterTradeType, normalizePositionName } from "@/lib/formatting";
import { NormalizedTrade } from "@/types/types";
/**
 * Normalizes a Jupiter trade to the standardized NormalizedTrade format
 * @param trade Jupiter trade to normalize
 * @returns Normalized trade
 */
export function normalizeJupiterTrade(trade: JupiterTrade): NormalizedTrade {
  const normalizedAction = mapJupiterTradeType(trade);
  const normalizedMarket = normalizePositionName(
    trade.positionName,
    trade.side
  );

  return {
    exchange: "Jupiter",
    timestamp: trade.createdTime,
    market: normalizedMarket,
    side: trade.side,
    action: normalizedAction,
    price: parseFloat(trade.price),
    sizeUsd: parseFloat(trade.size),
    collateralUsd: parseFloat(trade.collateralUsdDelta),
    fee: trade.fee,
    pnl: trade.pnl ? parseFloat(trade.pnl) : null,
    txId: trade.txHash,
  };
}
