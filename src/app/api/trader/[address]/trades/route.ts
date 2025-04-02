import { NextRequest, NextResponse } from "next/server";
import { FlashAdapter } from "@/core/adapters/flash.adapter";
import { JupiterAdapter } from "@/core/adapters/jupiter.adapter";
import { SolanaAddressSchema } from "@/core/schemas/trader.schema";
import { ZodError } from "zod";

// Create adapter instances
const flashAdapter = new FlashAdapter();
const jupiterAdapter = new JupiterAdapter();

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;

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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Parse exchange preferences from query params (if not provided, fetch from all available)
    const exchanges = {
      Flash: searchParams.get("flash") !== "false",
      Jupiter: searchParams.get("jupiter") !== "false",
    };

    // Fetch trades from each enabled exchange in parallel
    const fetchPromises = [];

    if (exchanges.Flash) {
      fetchPromises.push(
        flashAdapter.fetchTrades(address, { limit, offset }).catch((error) => {
          console.error("Error fetching Flash trades:", error);
          return { trades: [], totalCount: 0 };
        })
      );
    }

    if (exchanges.Jupiter) {
      fetchPromises.push(
        jupiterAdapter
          .fetchTrades(address, { limit, offset })
          .catch((error) => {
            console.error("Error fetching Jupiter trades:", error);
            return { trades: [], totalCount: 0 };
          })
      );
    }

    const results = await Promise.all(fetchPromises);

    // Combine all trades and sort by timestamp (newest first)
    const allTrades = results
      .flatMap((result) => result.trades)
      .sort((a, b) => b.timestamp - a.timestamp);

    // Calculate aggregated stats
    const totalCount = results.reduce(
      (sum, result) => sum + result.totalCount,
      0
    );

    // If requested limit is greater than what we have, we'll just return what we have
    const paginatedTrades = allTrades.slice(0, limit);

    return NextResponse.json({
      trades: paginatedTrades,
      totalCount,
      page: Math.floor(offset / limit) + 1,
      pageSize: limit,
      hasMore: offset + limit < totalCount,
    });
  } catch (error) {
    console.error("Trader trades error:", error);
    return NextResponse.json(
      { error: "Failed to fetch trader trades" },
      { status: 500 }
    );
  }
}
