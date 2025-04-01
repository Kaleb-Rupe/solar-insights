import { PublicKey } from "@solana/web3.js";
import { z } from "zod";

// Zod schema for Solana wallet addresses
export const walletAddressSchema = z
  .string()
  .regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/);

// Enhanced validation function using Zod
export const isValidSolanaAddress = (address: string): boolean => {
  try {
    // First check with Zod schema
    walletAddressSchema.parse(address);
    // Then verify with Solana's PublicKey
    new PublicKey(address);
    return true;
  } catch (error) {
    console.error("Invalid Solana address:", error);
    return false;
  }
};
