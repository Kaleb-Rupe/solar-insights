import { NextRequest, NextResponse } from "next/server";
import { SolanaAddressSchema } from "@/core/schemas/trader.schema";
import { FlashTradesResponseSchema } from "@/core/schemas/exchange.schema";
import { ZodError } from "zod";

export async function GET(request: NextRequest) {
  try {
    const address = request.nextUrl.searchParams.get("address");
    const page = request.nextUrl.searchParams.get("page");
    const take = request.nextUrl.searchParams.get("take");

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

    const flashApiBaseUrl = process.env.API_BASE_URL;
    const flashApiV3BaseUrl = process.env.API_BASE_URL_V3;

    if (!flashApiBaseUrl || !flashApiV3BaseUrl) {
      console.error("API configuration error: Missing Flash API URL");
      return NextResponse.json(
        { error: "API configuration error" },
        { status: 500 }
      );
    }

    let flashUrl = `${flashApiBaseUrl}${address}`;
    if (page && take) {
      flashUrl = `${flashApiV3BaseUrl}${address}?page=${page}&take=${take}`;
    }

    const flashResponse = await fetch(flashUrl, { next: { revalidate: 300 } });

    if (!flashResponse.ok) {
      return NextResponse.json(
        { error: `Flash API returned ${flashResponse.status}` },
        { status: flashResponse.status }
      );
    }

    const rawData = await flashResponse.json();

    // Validate response against schema
    try {
      const validatedData = FlashTradesResponseSchema.parse(rawData);
      return NextResponse.json(validatedData);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error("Flash API response validation error:", error.errors);
        return NextResponse.json(
          {
            error: "Invalid response format from Flash API",
            details: error.errors,
          },
          { status: 500 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Flash trades error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Flash trades" },
      { status: 500 }
    );
  }
}
