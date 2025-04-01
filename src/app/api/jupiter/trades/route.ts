import { NextRequest, NextResponse } from "next/server";
import { JupiterTrade } from "@/core/schemas";
import { NormalizedTrade } from "@/types/types";
import { normalizeJupiterTrade } from "@/services/exchanges/jupiter/normalize";

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

    const jupiterData: { dataList: JupiterTrade[]; count: number } =
      await jupiterResponse.json();

    // Normalize Jupiter trades
    const normalizedTrades: NormalizedTrade[] = jupiterData.dataList.map(
      (trade) => normalizeJupiterTrade(trade)
    );

    return NextResponse.json({
      dataList: normalizedTrades,
      count: jupiterData.count,
    });
  } catch (error) {
    console.error("Jupiter trades error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Jupiter trades" },
      { status: 500 }
    );
  }
}
