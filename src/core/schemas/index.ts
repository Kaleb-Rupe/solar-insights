// Flash API response schema
export interface FlashTrade {
  txId: string;
  eventIndex: number;
  timestamp: string;
  positionAddress: string;
  owner: string;
  market: string;
  side: "long" | "short";
  tradeType:
    | "CLOSE_POSITION"
    | "OPEN_POSITION"
    | "LIQUIDATE"
    | "ADD_COLLATERAL"
    | "REMOVE_COLLATERAL"
    | "INCREASE_SIZE"
    | "DECREASE_SIZE"
    | "TAKE_PROFIT"
    | "STOP_LOSS"
    | "OPEN_LIMIT_ORDER_POSITION";
  price: string | null;
  sizeUsd: string | null;
  sizeAmount: string | null;
  collateralUsd: string | null;
  collateralPrice: string | null;
  collateralPriceExponent: number | null;
  collateralAmount: string | null;
  pnlUsd: string | null;
  liquidationPrice: string | null;
  feeAmount: string | null;
  oraclePrice: string | null;
  oraclePriceExponent: number | null;
  orderPrice: string | null;
  orderPriceExponent: number | null;
  entryPrice: string | null;
  entryPriceExponent: number | null;
  feeRebateAmount: string | null;
  finalCollateralAmount: string | null;
  finalCollateralUsd: string | null;
  finalSizeUsd: string | null;
  finalSizeAmount: string | null;
  duration: string | null;
  exitPrice: string | null;
  exitPriceExponent: number | null;
  exitFeeAmount: string | null;
  id: number;
  entryFeeAmount: string | null;
  oracleAccountTimestamp: string | null;
  oracleAccountType: string | null;
  oracleAccountPrice: string | null;
  oracleAccountPriceExponent: number | null;
}

// Jupiter API response schema
export interface JupiterTrade {
  mint: string;
  positionName: string;
  side: "long" | "short";
  action: "Increase" | "Decrease";
  orderType: "Market" | "Trigger" | "Liquidation";
  collateralUsdDelta: string;
  price: string;
  size: string;
  fee: string;
  pnl: string | null;
  txHash: string;
  createdTime: number;
  updatedTime: number;
}