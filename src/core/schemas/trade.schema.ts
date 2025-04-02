import { z } from "zod";

// Base trade action types as discriminated unions
export const TradeActionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("open"),
    leverage: z.number().optional(),
  }),
  z.object({
    type: z.literal("close"),
    pnl: z.number().nullable(),
    reason: z.string().optional(),
  }),
  z.object({
    type: z.literal("increase"),
    additionalCollateral: z.number().optional(),
  }),
  z.object({
    type: z.literal("decrease"),
    withdrawnCollateral: z.number().optional(),
  }),
  z.object({
    type: z.literal("liquidate"),
    reason: z.string().optional(),
  }),
  z.object({
    type: z.literal("add_collateral"),
    amount: z.number(),
  }),
  z.object({
    type: z.literal("remove_collateral"),
    amount: z.number(),
  }),
  z.object({
    type: z.literal("take_profit"),
    targetPrice: z.number().optional(),
  }),
  z.object({
    type: z.literal("stop_loss"),
    triggerPrice: z.number().optional(),
  }),
  z.object({
    type: z.literal("open_limit_order"),
    limitPrice: z.number().optional(),
  }),
  z.object({
    type: z.literal("unknown"),
  }),
]);

// Normalized trade schema that works across exchanges
export const NormalizedTradeSchema = z.object({
  id: z.string(),
  exchange: z.enum(["Flash", "Jupiter"]),
  timestamp: z.number(),
  market: z.string(),
  side: z.enum(["long", "short"]),
  action: TradeActionSchema,
  price: z.string(),
  entryPrice: z.string().nullable(),
  exitPrice: z.string().nullable(),
  sizeUsd: z.number(),
  collateralUsd: z.number(),
  fee: z.string(),
  pnl: z.number().nullable(),
  txId: z.string(),
});

export const NormalizedTradesResponseSchema = z.object({
  trades: z.array(NormalizedTradeSchema),
  totalCount: z.number(),
  page: z.number().optional(),
  pageSize: z.number().optional(),
  hasMore: z.boolean().optional(),
});

// Types derived from zod schemas
export type TradeAction = z.infer<typeof TradeActionSchema>;
export type NormalizedTrade = z.infer<typeof NormalizedTradeSchema>;
export type NormalizedTradesResponse = z.infer<
  typeof NormalizedTradesResponseSchema
>;
