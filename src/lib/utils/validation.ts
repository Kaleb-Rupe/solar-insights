import { PublicKey } from "@solana/web3.js";
import { SolanaAddressSchema } from "@/core/schemas/trader.schema";

// Validate Solana wallet address
export const isValidSolanaAddress = (address: string): boolean => {
  try {
    // First validate with Zod schema
    SolanaAddressSchema.parse(address);

    // Then verify with Solana's PublicKey
    new PublicKey(address);
    return true;
  } catch (error) {
    console.error("Validation error:", error);
    return false;
  }
};
