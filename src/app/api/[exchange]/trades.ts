import { NextRequest, NextResponse } from "next/server";
import { getAdapter } from "@/core/adapters/adapterRegistry";

export async function GET(
  request: NextRequest,
  { params }: { params: { exchange: string } }
) {
  const { exchange } = params;
  const adapter = getAdapter(exchange);
  if (!adapter) {
    return NextResponse.json(
      { error: "Exchange not supported" },
      { status: 400 }
    );
  }
  const address = request.nextUrl.searchParams.get("address");
  if (!address) {
    return NextResponse.json(
      { error: "Wallet address required" },
      { status: 400 }
    );
  }
  const trades = await adapter.fetchTrades(address, {
    /* options */
  });
  return NextResponse.json(trades);
}
