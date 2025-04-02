import { MARKETS } from "@/core/domain/markets";
import { FlashTrade, JupiterTrade } from "@/core/schemas/exchange.schema";
import { NormalizedTrade } from "@/core/schemas/trade.schema";

/**
 * Formats a market value based on the market's denomination
 * @param value The value to format
 * @param market The market address
 * @returns Formatted value
 */
export const formatMarketValue = (value: string | number, market: string): number => {
  const marketInfo = MARKETS[market];
  if (!marketInfo) {
    console.error(`Unknown market: ${market}`);
    return 0;
  }
  return Number(value) / marketInfo.denomination;
};

/**
 * Checks if a number has consecutive two zeros after decimal
 * @param value The number to check
 * @returns Boolean indicating if it has consecutive zeros
 */
const hasConsecutiveTwoZeros = (value: number): boolean => {
  return value.toString().includes("." + "00") && value <= 1;
};

/**
 * Checks if a number has consecutive three zeros after decimal
 * @param value The number to check
 * @returns Boolean indicating if it has consecutive zeros
 */
const hasConsecutiveThreeZeros = (value: number): boolean => {
  return value.toString().includes("." + "000") && value <= 1;
};

/**
 * Formats a number as a currency string
 * @param value The number to format
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number): string => {
  if (hasConsecutiveThreeZeros(value)) {
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 5,
      maximumFractionDigits: 6,
      roundingMode: "trunc",
    });
  } else if (hasConsecutiveTwoZeros(value)) {
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
      roundingMode: "expand",
    });
  } else {
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      roundingMode: "trunc",
    });
  }
};

export const calculateFeeInUsd = (
  trade: FlashTrade
): NormalizedTrade["fee"] => {
  try {
    // For Flash trades
    const marketInfo = trade.market ? MARKETS[trade.market] : null;
    if (!marketInfo) {
      // Instead of just logging a warning, return a properly formatted value
      console.warn(`Unknown market: ${trade.market}`, trade);

      // Return a string representation of the fee or '0'
      return trade.feeAmount
        ? (Number(trade.feeAmount) / 1000000).toString()
        : "0";
    }

    const excludedMarkets = [
      "CxC8u5SBCtu9a53x7jSZtaAuJoKYA2ukXLuMuB9NtqoQ",
      "DXbQZYeT1LfyJvr86wnaMhwkPaFHazmHJkuyb1XzCmo3",
      "8p5imag5r4JBZoxb7Wq8ysgu9LpkPix7n4i9z6TJZDt7",
    ];
    const isExcluded = excludedMarkets.includes(trade.market);
    const feeAmount = trade.feeAmount ? Number(trade.feeAmount) : 0;

    // Helper to calculate and format fee with price
    const calculateFormattedFee = (price: number): NormalizedTrade["fee"] => {
      return formatCurrency(
        price *
          Number(`1e${marketInfo.exponent}`) *
          formatMarketValue(feeAmount, trade.market)
      );
    };

    if (trade.side === "long" && !isExcluded) {
      // Opening/Increasing trades
      if (
        [
          "OPEN_POSITION",
          "INCREASE_SIZE",
          "ADD_COLLATERAL",
          "OPEN_LIMIT_ORDER_POSITION",
        ].includes(trade.tradeType)
      ) {
        if (trade.entryPrice)
          return calculateFormattedFee(Number(trade.entryPrice));
        if (trade.oraclePrice)
          return calculateFormattedFee(Number(trade.oraclePrice));
        if (trade.price && trade.price !== "0") {
          return formatCurrency(
            Number(trade.price) *
              1e-6 *
              formatMarketValue(feeAmount, trade.market)
          );
        }
        if (
          trade.tradeType === "INCREASE_SIZE" &&
          trade.sizeUsd &&
          trade.sizeAmount
        ) {
          return formatCurrency(
            (Number(trade.sizeUsd) / Number(trade.sizeAmount)) *
              1e2 *
              formatMarketValue(feeAmount, trade.market)
          );
        }
        return "0";
      }
      // Closing/Decreasing trades
      else if (
        [
          "CLOSE_POSITION",
          "DECREASE_SIZE",
          "REMOVE_COLLATERAL",
          "TAKE_PROFIT",
          "STOP_LOSS",
          "LIQUIDATE",
        ].includes(trade.tradeType)
      ) {
        if (trade.exitPrice)
          return calculateFormattedFee(Number(trade.exitPrice));
        if (trade.oraclePrice)
          return calculateFormattedFee(Number(trade.oraclePrice));
        if (trade.price && trade.price !== "0") {
          return formatCurrency(
            Number(trade.price) *
              1e-6 *
              formatMarketValue(feeAmount, trade.market)
          );
        }
        if (
          trade.tradeType === "DECREASE_SIZE" &&
          trade.sizeUsd &&
          trade.sizeAmount
        ) {
          return formatCurrency(
            (Number(trade.sizeUsd) / Number(trade.sizeAmount)) *
              1e2 *
              formatMarketValue(feeAmount, trade.market)
          );
        }
        return "0";
      }
    }

    // Short positions or excluded markets
    return trade.feeAmount
      ? formatCurrency(Number(trade.feeAmount) * 1e-6)
      : "0";
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.warn(`Error calculating fee for trade: ${error.message}`, trade);
    } else {
      console.warn("Error calculating fee for trade:", error, trade);
    }
    return "0"; // Return a safe default value as a string
  }
};

/**
 * Maps Flash trade type to normalized action
 * @param tradeType Flash trade type
 * @returns Normalized action
 */
export const mapFlashTradeAction = (
  tradeType: FlashTrade["tradeType"]
): NormalizedTrade["action"] => {
  const actionMap: { [key: string]: NormalizedTrade["action"] } = {
    OPEN_POSITION: { type: "open" },
    CLOSE_POSITION: { type: "close", pnl: 0 },
    INCREASE_SIZE: { type: "increase", additionalCollateral: 0 },
    DECREASE_SIZE: { type: "decrease", withdrawnCollateral: 0 },
    LIQUIDATE: { type: "liquidate" },
    ADD_COLLATERAL: { type: "add_collateral", amount: 0 },
    REMOVE_COLLATERAL: { type: "remove_collateral", amount: 0 },
    TAKE_PROFIT: { type: "take_profit", targetPrice: 0 },
    STOP_LOSS: { type: "stop_loss", triggerPrice: 0 },
    OPEN_LIMIT_ORDER_POSITION: { type: "open_limit_order", limitPrice: 0 },
  };

  return actionMap[tradeType] || "unknown";
};

/**
 * Maps Jupiter trade type to a normalized action
 * @param trade Jupiter trade to map
 * @returns Normalized action
 */
export const mapJupiterTradeType = (
  trade: JupiterTrade
): NormalizedTrade["action"] => {
  const { action, orderType, pnl } = trade;
  if (orderType === "Liquidation") return { type: "liquidate" };
  if (orderType === "Market") {
    if (action === "Increase") return { type: "open" };
    if (action === "Decrease") return { type: "close", pnl: 0 };
  }
  if (orderType === "Trigger") {
    const pnlValue = pnl ? Number(pnl) : 0;
    if (pnlValue < 0) return { type: "stop_loss", triggerPrice: 0 };
    if (pnlValue > 0) return { type: "take_profit", targetPrice: 0 };
    return { type: "close", pnl: 0 };
  }
  return { type: "unknown" };
};

/**
 * Normalizes a position name to be consistent across exchanges
 * @param positionName Original position name
 * @param side Long or short side
 * @returns Normalized market name
 */
export function normalizePositionName(
  positionName: string,
  side: string
): string {
  const baseName = positionName.replace(/-PERP$/, "");
  return side === "short" ? `${baseName}-SHORT` : baseName;
}

/**
 * Formats a timestamp to a readable date string
 * @param timestamp Unix timestamp in milliseconds
 * @returns Formatted date string
 */
export const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString();
};

/**
 * Formats a value as a percentage
 * @param value The number to format
 * @param decimals Number of decimal places
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number, decimals = 2): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Get trade price based on trade data and exchange
 */
export const getFlashTradePrice = (trade: FlashTrade): NormalizedTrade["price"] => {
  const marketInfo = trade.market ? MARKETS[trade.market] : null;
  if (!marketInfo) {
    return "0";
  }

    if (trade.side === "short") {
      if (trade.exitPrice) {
        return formatCurrency(
          Number(trade.exitPrice) * Number(`1e${marketInfo.exponent}`)
        );
      } else if (trade.entryPrice) {
        return formatCurrency(
          Number(trade.entryPrice) * Number(`1e${marketInfo.exponent}`)
        );
      } else if (trade.oraclePrice) {
        return formatCurrency(
          Number(trade.oraclePrice) * Number(`1e${marketInfo.exponent}`)
        );
      } else if (trade.price) {
        return formatCurrency(Number(trade.price) * 1e-6);
      } else if (trade.sizeUsd && trade.sizeAmount) {
        return formatCurrency(
          (Number(trade.sizeUsd) * 1e-6) /
            (Number(trade.sizeAmount) / marketInfo.denomination)
        );
      }
    } else {
      // Long side
      if (trade.exitPrice) {
        return formatCurrency(
          Number(trade.exitPrice) * Number(`1e${marketInfo.exponent}`)
        );
      } else if (
        trade.price &&
        (trade.tradeType === "CLOSE_POSITION" ||
          trade.tradeType === "DECREASE_SIZE" ||
          trade.tradeType === "REMOVE_COLLATERAL" ||
          trade.tradeType === "TAKE_PROFIT" ||
          trade.tradeType === "STOP_LOSS" ||
          trade.tradeType === "LIQUIDATE")
      ) {
        return formatCurrency(Number(trade.price) * 1e-6);
      } else if (
        trade.sizeUsd &&
        trade.sizeAmount &&
        (trade.tradeType === "CLOSE_POSITION" ||
          trade.tradeType === "DECREASE_SIZE" ||
          trade.tradeType === "REMOVE_COLLATERAL" ||
          trade.tradeType === "TAKE_PROFIT" ||
          trade.tradeType === "STOP_LOSS" ||
          trade.tradeType === "LIQUIDATE")
      ) {
        formatCurrency(
          (Number(trade.sizeUsd) * 1e-6) /
            (Number(trade.sizeAmount) / MARKETS[trade.market].denomination)
        );
      } else if (trade.entryPrice) {
        return formatCurrency(
          Number(trade.entryPrice) * Number(`1e${marketInfo.exponent}`)
        );
      } else if (trade.oraclePrice) {
        return formatCurrency(
          Number(trade.oraclePrice) * Number(`1e${marketInfo.exponent}`)
        );
      } else if (trade.price) {
        return formatCurrency(Number(trade.price) * 1e-6);
      } else if (trade.sizeUsd && trade.sizeAmount) {
        return formatCurrency(
          (Number(trade.sizeUsd) * 1e-6) /
            (Number(trade.sizeAmount) / marketInfo.denomination)
        );
      }
    }

  return "0";
};

export const getJupiterExitPrice = (
  trade: JupiterTrade
): NormalizedTrade["exitPrice"] => {
  if (trade.orderType === "Market" && trade.action === "Decrease") {
    return trade.price ? formatCurrency(Number(trade.price)) : "-";
  } else if (trade.orderType === "Trigger" && trade.action === "Decrease") {
    return trade.price ? formatCurrency(Number(trade.price)) : "-";
  } else if (trade.orderType === "Liquidation") {
    return trade.price ? formatCurrency(Number(trade.price)) : "-";
  }
  return "-";
};

export const getJupiterEntryPrice = (
  trade: JupiterTrade
): NormalizedTrade["entryPrice"] => {
  if (trade.orderType === "Market" && trade.action === "Increase") {
    return trade.price ? formatCurrency(Number(trade.price)) : "-";
  }
  return "-";
};

/**
 * Get trade entry price based on trade data and exchange
 */
export const getFlashEntryPrice = (
  trade: FlashTrade
): NormalizedTrade["entryPrice"] => {
  const marketInfo = trade.market ? MARKETS[trade.market] : null;
  if (!marketInfo) {
    return "-";
  }

  if (trade.entryPrice) {
    return formatCurrency(
      Number(trade.entryPrice) * Number(`1e${MARKETS[trade.market].exponent}`)
    );
  } else if (
    trade.oraclePrice &&
    (trade.tradeType === "OPEN_POSITION" ||
      trade.tradeType === "INCREASE_SIZE" ||
      trade.tradeType === "ADD_COLLATERAL" ||
      trade.tradeType === "OPEN_LIMIT_ORDER_POSITION")
  ) {
    formatCurrency(
      Number(trade.oraclePrice) * Number(`1e${MARKETS[trade.market].exponent}`)
    );
  } else if (trade.price) {
    return formatCurrency(Number(trade.price) * 1e-6);
  } else if (trade.sizeUsd && trade.sizeAmount) {
    return formatCurrency(
      (Number(trade.sizeUsd) * 1e-6) /
        (Number(trade.sizeAmount) / MARKETS[trade.market].denomination)
    );
  }

  return "-";
};

/**
 * Get trade exit price based on trade data and exchange
 */
export const getFlashExitPrice = (
  trade: FlashTrade
): NormalizedTrade["exitPrice"] => {
  const marketInfo = trade.market ? MARKETS[trade.market] : null;
  if (!marketInfo) {
    return "-";
  }

  if (trade.exitPrice) {
    return formatCurrency(
      Number(trade.exitPrice) * Number(`1e${MARKETS[trade.market].exponent}`)
    );
  } else if (
    trade.oraclePrice &&
    (trade.tradeType === "CLOSE_POSITION" ||
      trade.tradeType === "DECREASE_SIZE" ||
      trade.tradeType === "REMOVE_COLLATERAL" ||
      trade.tradeType === "TAKE_PROFIT" ||
      trade.tradeType === "STOP_LOSS" ||
      trade.tradeType === "LIQUIDATE")
  ) {
    formatCurrency(
      Number(trade.oraclePrice) * Number(`1e${MARKETS[trade.market].exponent}`)
    );
  } else if (
    trade.price &&
    (trade.tradeType === "CLOSE_POSITION" ||
      trade.tradeType === "DECREASE_SIZE" ||
      trade.tradeType === "REMOVE_COLLATERAL" ||
      trade.tradeType === "TAKE_PROFIT" ||
      trade.tradeType === "STOP_LOSS" ||
      trade.tradeType === "LIQUIDATE")
  ) {
    return formatCurrency(Number(trade.price) * 1e-6);
  }

  return "-";
};
