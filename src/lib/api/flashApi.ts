import { NormalizedTrade } from "@/types/types";
import { isValidSolanaAddress } from "@/lib/walletValidation";

export const fetchFlashHistory = async (
  address: string,
  forceRefresh = false,
  signal?: AbortSignal
): Promise<NormalizedTrade[]> => {
  try {
    const validatedAddress = isValidSolanaAddress(address);
    const response = await fetch(
      `/api/flash/trades?address=${validatedAddress}`,
      { signal, cache: forceRefresh ? "no-store" : "default" }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json(); // Already normalized
  } catch (error) {
    console.error("Error in fetchFlashHistory:", error);
    if (process.env.NODE_ENV === "development") {
      console.log("Returning empty array for Flash trades in development mode");
      return [];
    }
    throw error;
  }
};

export const checkFlashDataAvailability = async (
  address: string,
  forceRefresh = false,
  signal?: AbortSignal
): Promise<boolean> => {
  try {
    const validatedAddress = isValidSolanaAddress(address);
    const response = await fetch(
      `/api/wallet-check?address=${validatedAddress}`,
      { signal, cache: forceRefresh ? "no-store" : "default" }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.availableExchanges.includes("Flash");
  } catch (error) {
    if (error instanceof Error && error.name !== "AbortError") {
      console.error("Error in checkFlashDataAvailability:", error);
    }
    return false;
  }
};
