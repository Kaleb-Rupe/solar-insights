import { NormalizedTrade } from "@/types/types";
import { isValidSolanaAddress } from "@/lib/utils/validation";

export const fetchAllJupiterTradeHistory = async (
  address: string,
  forceRefresh = false,
  signal?: AbortSignal
): Promise<{ dataList: NormalizedTrade[]; count: number }> => {
  try {
    const validatedAddress = isValidSolanaAddress(address);
    const TRADES_PER_PAGE = 100;

    const initialResponse = await fetch(
      `/api/jupiter/trades?address=${validatedAddress}&start=0&end=${TRADES_PER_PAGE}`,
      { signal, cache: forceRefresh ? "no-store" : "default" }
    );

    if (!initialResponse.ok) {
      throw new Error(`API error: ${initialResponse.status}`);
    }

    const initialData = await initialResponse.json();
    const totalCount = initialData.count;
    let allTrades = [...initialData.dataList];

    if (totalCount > TRADES_PER_PAGE) {
      for (
        let start = TRADES_PER_PAGE;
        start < totalCount;
        start += TRADES_PER_PAGE
      ) {
        const response = await fetch(
          `/api/jupiter/trades?address=${validatedAddress}&start=${start}&end=${
            start + TRADES_PER_PAGE
          }`,
          { signal, cache: forceRefresh ? "no-store" : "default" }
        );

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        allTrades = [...allTrades, ...data.dataList];
      }
    }

    return { dataList: allTrades, count: totalCount };
  } catch (error) {
    console.error("Error in fetchAllJupiterTradeHistory:", error);
    throw error;
  }
};

export const checkJupiterDataAvailability = async (
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
    return data.availableExchanges.includes("Jupiter");
  } catch (error) {
    console.error("Error in checkJupiterDataAvailability:", error);
    return false;
  }
};
