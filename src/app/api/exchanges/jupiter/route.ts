import { NextRequest, NextResponse } from "next/server";
import { SolanaAddressSchema } from "@/core/schemas/trader.schema";
import { JupiterTradesResponseSchema } from "@/core/schemas/exchange.schema";
import { ZodError } from "zod";

export async function GET(request: NextRequest) {
  try {
    const address = request.nextUrl.searchParams.get("address");
    const start = parseInt(request.nextUrl.searchParams.get("start") || "0");
    const end = parseInt(request.nextUrl.searchParams.get("end") || "100");

    if (!address) {
      return NextResponse.json(
        { error: "Wallet address required" },
        { status: 400 }
      );
    }

    // Validate address format
    try {
      SolanaAddressSchema.parse(address);
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          { error: "Invalid Solana address format", details: error.errors },
          { status: 400 }
        );
      }
      throw error;
    }

    const jupiterApiBaseUrl = process.env.JUPITER_API_BASE_URL;
    if (!jupiterApiBaseUrl) {
      console.error("API configuration error: Missing Jupiter API URL");
      return NextResponse.json(
        { error: "API configuration error" },
        { status: 500 }
      );
    }

    const jupiterResponse = await fetch(
      `${jupiterApiBaseUrl}/trades?walletAddress=${address}&start=${start}&end=${end}`,
      { next: { revalidate: 300 } }
    );

    if (!jupiterResponse.ok) {
      return NextResponse.json(
        { error: `Jupiter API returned ${jupiterResponse.status}` },
        { status: jupiterResponse.status }
      );
    }

    const rawData = await jupiterResponse.json();

    // Validate response against schema
    try {
      const validatedData = JupiterTradesResponseSchema.parse(rawData);
      return NextResponse.json(validatedData);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error("Jupiter API response validation error:", error.errors);
        return NextResponse.json(
          {
            error: "Invalid response format from Jupiter API",
            details: error.errors,
          },
          { status: 500 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Jupiter trades error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Jupiter trades" },
      { status: 500 }
    );
  }
}
