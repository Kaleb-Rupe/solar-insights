import { z } from "zod";

// Raw Flash trade schema (matches API response format)
export const FlashTradeSchema = z.object({
  txId: z.string(),
  eventIndex: z.number(),
  timestamp: z.string(),
  positionAddress: z.string(),
  owner: z.string(),
  market: z.string(),
  side: z.enum(["long", "short"]),
  tradeType: z.enum([
    "CLOSE_POSITION",
    "OPEN_POSITION",
    "LIQUIDATE",
    "ADD_COLLATERAL",
    "REMOVE_COLLATERAL",
    "INCREASE_SIZE",
    "DECREASE_SIZE",
    "TAKE_PROFIT",
    "STOP_LOSS",
    "OPEN_LIMIT_ORDER_POSITION",
  ]),
  price: z.string().nullable(),
  sizeUsd: z.string().nullable(),
  sizeAmount: z.string().nullable(),
  collateralUsd: z.string().nullable(),
  collateralPrice: z.string().nullable(),
  collateralPriceExponent: z.number().nullable(),
  collateralAmount: z.string().nullable(),
  pnlUsd: z.string().nullable(),
  liquidationPrice: z.string().nullable(),
  feeAmount: z.string().nullable(),
  oraclePrice: z.string().nullable(),
  oraclePriceExponent: z.number().nullable(),
  orderPrice: z.string().nullable(),
  orderPriceExponent: z.number().nullable(),
  entryPrice: z.string().nullable(),
  entryPriceExponent: z.number().nullable(),
  feeRebateAmount: z.string().nullable(),
  finalCollateralAmount: z.string().nullable(),
  finalCollateralUsd: z.string().nullable(),
  finalSizeUsd: z.string().nullable(),
  finalSizeAmount: z.string().nullable(),
  duration: z.string().nullable(),
  exitPrice: z.string().nullable(),
  exitPriceExponent: z.number().nullable(),
  exitFeeAmount: z.string().nullable(),
  id: z.number(),
  entryFeeAmount: z.string().nullable(),
  oracleAccountTimestamp: z.string().nullable(),
  oracleAccountType: z.string().nullable(),
  oracleAccountPrice: z.string().nullable(),
  oracleAccountPriceExponent: z.number().nullable(),
});

// Raw Jupiter trade schema (matches API response format)
export const JupiterTradeSchema = z.object({
  mint: z.string(),
  positionName: z.string(),
  side: z.enum(["long", "short"]),
  action: z.enum(["Increase", "Decrease"]),
  orderType: z.enum(["Market", "Trigger", "Liquidation"]),
  collateralUsdDelta: z.string(),
  price: z.string(),
  size: z.string(),
  fee: z.string(),
  pnl: z.string().nullable(),
  txHash: z.string(),
  createdTime: z.number(),
  updatedTime: z.number(),
});

// Important: Match Jupiter's specific response format with dataList and count
export const JupiterTradesResponseSchema = z.object({
  dataList: z.array(JupiterTradeSchema),
  count: z.number(),
});

// Flash trades array schema
export const FlashTradesResponseSchema = z.array(FlashTradeSchema);

export type FlashTrade = z.infer<typeof FlashTradeSchema>;
export type JupiterTrade = z.infer<typeof JupiterTradeSchema>;
export type JupiterTradesResponse = z.infer<typeof JupiterTradesResponseSchema>;
export type FlashTradesResponse = z.infer<typeof FlashTradesResponseSchema>;
