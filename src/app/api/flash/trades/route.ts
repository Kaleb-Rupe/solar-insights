import { NextRequest, NextResponse } from "next/server";
import { FlashTrade } from "@/core/schemas";
import { NormalizedTrade } from "@/types/types";
import { normalizeFlashTrade } from "@/services/exchanges/flash/normalize";

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

    const flashData: FlashTrade[] = await flashResponse.json();

    // Normalize Flash trades
    const normalizedTrades: NormalizedTrade[] = flashData.map((trade) =>
      normalizeFlashTrade(trade)
    );

    return NextResponse.json(normalizedTrades);
  } catch (error) {
    console.error("Flash trades error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Flash trades" },
      { status: 500 }
    );
  }
}
