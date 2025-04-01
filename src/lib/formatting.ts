import { MARKETS } from "@/core/markets/index";
import { FlashTrade, JupiterTrade } from "@/core/schemas/index";
import { NormalizedTrade } from "@/types/types";

/**
 * Formats a market value based on the market's denomination
 * @param value The value to format
 * @param market The market address
 * @returns Formatted value
 */
export const formatMarketValue = (value: string | number, market: string) => {
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
export const formatCurrency = (value: number) => {
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
    OPEN_POSITION: "open",
    CLOSE_POSITION: "close",
    INCREASE_SIZE: "increase",
    DECREASE_SIZE: "decrease",
    LIQUIDATE: "liquidate",
    ADD_COLLATERAL: "add_collateral",
    REMOVE_COLLATERAL: "remove_collateral",
    TAKE_PROFIT: "take_profit",
    STOP_LOSS: "stop_loss",
    OPEN_LIMIT_ORDER_POSITION: "open_limit_order",
  };

  return actionMap[tradeType] || "unknown";
};

/**
 * Maps Jupiter trade type to a normalized action
 * @param trade Jupiter trade to map
 * @returns Normalized action
 */
export const mapJupiterTradeType = (trade: JupiterTrade): NormalizedTrade["action"] => {
  const { action, orderType, pnl } = trade;
  if (orderType === "Liquidation") return "liquidate";
  if (orderType === "Market") {
    if (action === "Increase") return "open";
    if (action === "Decrease") return "close";
  }
  if (orderType === "Trigger") {
    const pnlValue = pnl ? Number(pnl) : 0;
    if (pnlValue < 0) return "stop_loss";
    if (pnlValue > 0) return "take_profit";
    return "close";
  }
  return "unknown";
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