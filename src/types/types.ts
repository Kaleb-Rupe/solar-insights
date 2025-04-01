// Normalized trade schema
export interface NormalizedTrade {
  exchange: "Flash" | "Jupiter";
  timestamp: number;
  market: string; // Human-readable market name
  side: "long" | "short";
  action:
    | "open"
    | "close"
    | "increase"
    | "decrease"
    | "liquidate"
    | "add_collateral"
    | "remove_collateral"
    | "take_profit"
    | "stop_loss"
    | "open_limit_order"
    | "unknown";
  price: number;
  sizeUsd: number;
  collateralUsd: number;
  fee: string;
  pnl: number | null;
  txId: string;
}

// User preferences schema
export interface UserPreferences {
  exchanges: {
    Flash: boolean;
    Jupiter: boolean;
  };
}

// API request/response types
export interface GetTradesRequest {
  wallet?: string;
  preferences: UserPreferences;
}

export interface GetTradesResponse {
  trades: NormalizedTrade[];
  error?: string;
}

export interface FetchOptions {
  limit?: number;
  offset?: number;
  // Add other options as needed
}
