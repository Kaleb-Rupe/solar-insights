import { z } from "zod";

// Wallet validation schema using Solana address format
export const SolanaAddressSchema = z
  .string()
  .regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, "Invalid Solana address format");

// User preferences schema
export const UserPreferencesSchema = z.object({
  exchanges: z.object({
    Flash: z.boolean().default(true),
    Jupiter: z.boolean().default(true),
  }),
  timeframe: z
    .enum([
      // Intraday options
      "1h",
      "4h",
      "12h",
      "24h",

      // Short term options
      "1d",
      "3d",
      "7d",
      "7d-prev",

      // Medium term options
      "30d",
      "30d-prev",
      "90d",
      "180d",

      // Long term options
      "ytd",
      "1y",
      "all",
    ])
    .default("all"),
  theme: z.enum(["light", "dark", "system"]).default("system"),
});

// Trader profile schema
export const TraderProfileSchema = z.object({
  address: SolanaAddressSchema,
  preferences: UserPreferencesSchema,
  availableExchanges: z.array(z.enum(["Flash", "Jupiter"])),
  lastUpdated: z.number().optional(),
});

// API request schema for trader data
export const TraderRequestSchema = z.object({
  address: SolanaAddressSchema,
});

export type SolanaAddress = z.infer<typeof SolanaAddressSchema>;
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;
export type TraderProfile = z.infer<typeof TraderProfileSchema>;
