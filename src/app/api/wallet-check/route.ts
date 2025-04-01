import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const address = request.nextUrl.searchParams.get("address");
    if (!address) {
      return NextResponse.json(
        { error: "Wallet address required" },
        { status: 400 }
      );
    }

    const jupiterApiBaseUrl = process.env.JUPITER_API_BASE_URL;
    const flashApiBaseUrl = process.env.API_BASE_URL_V3;

    if (!jupiterApiBaseUrl || !flashApiBaseUrl) {
      console.error("API configuration error: Missing API URLs");
      return NextResponse.json(
        { error: "API configuration error" },
        { status: 500 }
      );
    }

    let hasJupiterData = false;
    try {
      const jupiterResponse = await fetch(
        `${jupiterApiBaseUrl}/trades?walletAddress=${address}&start=0&end=1`,
        { next: { revalidate: 60 } }
      );
      if (jupiterResponse.ok) {
        const jupiterData = await jupiterResponse.json();
        hasJupiterData = jupiterData.dataList?.length > 0;
      }
    } catch (jupiterError) {
      console.error("Jupiter API error:", jupiterError);
    }

    let hasFlashData = false;
    try {
      const flashResponse = await fetch(
        `${flashApiBaseUrl}${address}?page=1&take=1`,
        { next: { revalidate: 60 } }
      );
      if (flashResponse.ok) {
        const flashData = await flashResponse.json();
        hasFlashData = flashData.length > 0;
      }
    } catch (flashError) {
      console.error("Flash API error:", flashError);
    }

    const hasData = hasJupiterData || hasFlashData;
    const availableExchanges = [
      ...(hasJupiterData ? ["Jupiter"] : []),
      ...(hasFlashData ? ["Flash"] : []),
    ];

    return NextResponse.json({ hasData, availableExchanges });
  } catch (error) {
    console.error("Wallet check error:", error);
    return NextResponse.json(
      { error: "Failed to check wallet availability" },
      { status: 500 }
    );
  }
}
