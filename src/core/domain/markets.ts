/**
 * Market information for various trading pairs.
 * Contains market metadata needed for calculations and display.
 */

export interface MarketInfo {
  name: string;
  denomination: number;
  isShortMarket?: boolean;
  baseMarket?: string;
  exponent: number;
}

export const MARKETS: { [key: string]: MarketInfo } = {
  "3vHoXbUvGhEHFsLUmxyC6VWsbYDreb1zMn9TAp5ijN5K": {
    name: "SOL",
    denomination: 1_000_000_000,
    exponent: -8,
    isShortMarket: false,
  },
  "9tvuK63WUV2mgWt7AvWUm7kRUpFKsRX1jewyJ21VTWsM": {
    name: "SOL-SHORT",
    denomination: 1_000_000,
    exponent: -8,
    isShortMarket: true,
    baseMarket: "3vHoXbUvGhEHFsLUmxyC6VWsbYDreb1zMn9TAp5ijN5K",
  },
  EHUaxjoTqTJTWRwQQNy1Wq4sDGdua5r6YGvFzPcuA1eV: {
    name: "SOL",
    denomination: 1_000_000_000,
    exponent: -8,
    isShortMarket: false,
  },
  GGV4VHTAEyWGyGubXTiQZiPajCEtGv2Ed2G2BHmY3zNZ: {
    name: "BTC",
    denomination: 100_000_000,
    exponent: -8,
    isShortMarket: false,
  },
  AAHFmCVd4JXXrLFmGBataeCJ6CwrYs4cYMiebXmBFvPE: {
    name: "BTC-SHORT",
    denomination: 1_000_000,
    exponent: -8,
    isShortMarket: true,
    baseMarket: "GGV4VHTAEyWGyGubXTiQZiPajCEtGv2Ed2G2BHmY3zNZ",
  },
  "8r5MBC3oULSWdm69yn2q3gBLp6h1AL4Wo11LBzcCZGWJ": {
    name: "ETH",
    denomination: 100_000_000,
    exponent: -8,
    isShortMarket: false,
  },
  GxkxRPheec7f9ZbamzeWdiHiMbrgyoUV7MFPxXW1387q: {
    name: "ETH-SHORT",
    denomination: 1_000_000,
    exponent: -8,
    isShortMarket: true,
    baseMarket: "8r5MBC3oULSWdm69yn2q3gBLp6h1AL4Wo11LBzcCZGWJ",
  },
  "5QQstJ2LpeHESWqGTWBw5aid8h4cdVUjXU61R84Pj2jr": {
    name: "JUP",
    denomination: 1_000_000,
    exponent: -8,
    isShortMarket: false,
  },
  Hi8kSmbtzucZpEYxvcq2H1QuyUCRuY3m7WGmTF2RhkVw: {
    name: "JUP-SHORT",
    denomination: 1_000_000,
    exponent: -8,
    isShortMarket: true,
    baseMarket: "5QQstJ2LpeHESWqGTWBw5aid8h4cdVUjXU61R84Pj2jr",
  },
  "9V9eYLhVV13VoSfi3McfMcN7ie4WNkRdTbHggkaT8QCQ": {
    name: "PYTH",
    denomination: 1_000_000,
    exponent: -8,
    isShortMarket: false,
  },
  "2By2fgwfZQetZ56414KBDMZwNBstg3GAJtEePQtf3Aty": {
    name: "PYTH-SHORT",
    denomination: 1_000_000,
    exponent: -8,
    isShortMarket: true,
    baseMarket: "9V9eYLhVV13VoSfi3McfMcN7ie4WNkRdTbHggkaT8QCQ",
  },
  "7gnDo7scDFYmEnXW2JrGRzCrynmbakoCMqaEo7d2fydG": {
    name: "JTO",
    denomination: 1_000_000_000,
    exponent: -8,
    isShortMarket: false,
  },
  G7RdCWx4eNfLdagGp4H2tKwhTi9JihBozVLGMVduF1Xe: {
    name: "JTO-SHORT",
    denomination: 1_000_000,
    exponent: -8,
    isShortMarket: true,
    baseMarket: "7gnDo7scDFYmEnXW2JrGRzCrynmbakoCMqaEo7d2fydG",
  },
  FaT568uYioPFsf2rFgSSFrNyrqHZfG9LZBReaq56dSYJ: {
    name: "KMNO",
    denomination: 1_000_000,
    exponent: -8,
    isShortMarket: false,
  },
  Hfkgp91DXQivzd8XihGHh7ansPm1SFfosNZ5CN3yz1PW: {
    name: "KMNO-SHORT",
    denomination: 1_000_000,
    exponent: -8,
    isShortMarket: true,
    baseMarket: "FaT568uYioPFsf2rFgSSFrNyrqHZfG9LZBReaq56dSYJ",
  },
  DvvnSEZueicT9UN9WMvfYP3B4NQDgiNjjtbKLenLakxv: {
    name: "BONK",
    denomination: 100_000,
    exponent: -10,
    isShortMarket: false,
  },
  "3EYDn8VkY19QBStG4QtvLAdPScReLS7kuchhterF7ADP": {
    name: "BONK-SHORT",
    denomination: 1_000_000,
    exponent: -10,
    isShortMarket: true,
    baseMarket: "DvvnSEZueicT9UN9WMvfYP3B4NQDgiNjjtbKLenLakxv",
  },
  Dk2P1xDyewb9nxsMacw6gfuhTb3DqPZM1Sm97K66CTQK: {
    name: "W",
    denomination: 1_000_000,
    exponent: -6,
    isShortMarket: false,
  },
  "9mMAN4hFvw5AGB6eNay1WvNsGoyK9xcBafZ5tVbHcHQq": {
    name: "W-SHORT",
    denomination: 1_000_000,
    exponent: -6,
    isShortMarket: true,
    baseMarket: "Dk2P1xDyewb9nxsMacw6gfuhTb3DqPZM1Sm97K66CTQK",
  },
  DRMbqfx6No2MzRLtyo4RUaKExe4daiVAXKsX3F3RAK3u: {
    name: "WIF",
    denomination: 1_000_000,
    exponent: -8,
    isShortMarket: false,
  },
  "9X4S2ZeFdpoTe5LkEUZ6hPqkTo6k4LyYpBZJiwBVRj6": {
    name: "WIF-SHORT",
    denomination: 1_000_000,
    exponent: -8,
    isShortMarket: true,
    baseMarket: "DRMbqfx6No2MzRLtyo4RUaKExe4daiVAXKsX3F3RAK3u",
  },
  aZCThBPnK1j8feCAKnVtS3QjULzNwPDy4a8V3FzbM9V: {
    name: "RAY",
    denomination: 1_000_000,
    exponent: -8,
    isShortMarket: false,
  },
  "6u6QrwkmAF4kzk41FkjpLv8AbYaTtkRtbmVZsPSf7wSd": {
    name: "RAY-SHORT",
    denomination: 1_000_000,
    exponent: -8,
    isShortMarket: true,
    baseMarket: "aZCThBPnK1j8feCAKnVtS3QjULzNwPDy4a8V3FzbM9V",
  },
  "53zJK3muUnpmp1LBZKYiiDsJLnqNw9vTWALVanaRMdyv": {
    name: "TRUMP",
    denomination: 1_000_000,
    exponent: -8,
    isShortMarket: false,
  },
  DvK3NQLuwEH525Yw8XchJySNYWiy1gZNY4wfPENBakA3: {
    name: "TRUMP-SHORT",
    denomination: 1_000_000,
    exponent: -8,
    isShortMarket: true,
    baseMarket: "53zJK3muUnpmp1LBZKYiiDsJLnqNw9vTWALVanaRMdyv",
  },
  FULXckUCpsHnUsaXZNys4bFCbY5s2199SEg6eyeQuxTH: {
    name: "SAMO",
    denomination: 1_000_000_000,
    exponent: -8,
    isShortMarket: false,
  },
  GchNQzigTFP4bUuH3LwdoDSvn1fexHw84Gtjap8x8Ppm: {
    name: "SAMO-SHORT",
    denomination: 1_000_000,
    exponent: -8,
    isShortMarket: true,
    baseMarket: "FULXckUCpsHnUsaXZNys4bFCbY5s2199SEg6eyeQuxTH",
  },
  FPYjBQg9PL1qjCEqSK6RDs4T9Lhip1uJytkpB7zzG35N: {
    name: "PENGU",
    denomination: 1_000_000,
    exponent: -8,
    isShortMarket: false,
  },
  A39w24T4wWqx9ZRk8dPKQjQL9xgwBhPGc1dBmFfBh4mY: {
    name: "PENGU-SHORT",
    denomination: 1_000_000,
    exponent: -8,
    isShortMarket: true,
    baseMarket: "FPYjBQg9PL1qjCEqSK6RDs4T9Lhip1uJytkpB7zzG35N",
  },
  CxC8u5SBCtu9a53x7jSZtaAuJoKYA2ukXLuMuB9NtqoQ: {
    name: "AUD",
    denomination: 100_000,
    exponent: -5,
    isShortMarket: false,
  },
  JCwYots22PTcPn2XQz9un15kMj6tqEYjUKgQaay5sMY1: {
    name: "AUD-SHORT",
    denomination: 100_000,
    exponent: -5,
    isShortMarket: true,
    baseMarket: "CxC8u5SBCtu9a53x7jSZtaAuJoKYA2ukXLuMuB9NtqoQ",
  },
  DXbQZYeT1LfyJvr86wnaMhwkPaFHazmHJkuyb1XzCmo3: {
    name: "EURO",
    denomination: 100_000,
    exponent: -5,
    isShortMarket: false,
  },
  "2CvUh7whei331D2djP4W2QwV7UUiMbpKgfJNSDojcjne": {
    name: "EURO-SHORT",
    denomination: 100_000,
    exponent: -5,
    isShortMarket: true,
    baseMarket: "DXbQZYeT1LfyJvr86wnaMhwkPaFHazmHJkuyb1XzCmo3",
  },
  "8p5imag5r4JBZoxb7Wq8ysgu9LpkPix7n4i9z6TJZDt7": {
    name: "GBP",
    denomination: 100_000,
    exponent: -5,
    isShortMarket: false,
  },
  "6pKnzQwmrSCz6HK4C4qXUscysGpQj381ksmNwmVHSdJ4": {
    name: "GBP-SHORT",
    denomination: 100_000,
    exponent: -5,
    isShortMarket: true,
    baseMarket: "8p5imag5r4JBZoxb7Wq8ysgu9LpkPix7n4i9z6TJZDt7",
  },
  "88zawd3Rw6tknWvgEm8QBgBuf5Y2GTeA18S788qUrSnM": {
    name: "XAU",
    denomination: 100_000_000,
    exponent: -3,
    isShortMarket: false,
  },
  G2rj5artQzevbsQtCJ1rkDt3Pd5b6ZYAf8e9AjZPipui: {
    name: "XAU",
    denomination: 100_000_000,
    exponent: -3,
    isShortMarket: true,
    baseMarket: "88zawd3Rw6tknWvgEm8QBgBuf5Y2GTeA18S788qUrSnM",
  },
  Caqzhuj2Hj5MUwQigdtLNokLZbuqs6NrcmwWbMsSqwqH: {
    name: "XAG",
    denomination: 100_000_000,
    exponent: -3,
    isShortMarket: false,
  },
  "7JwSejqoicRSzks3mKwk9TPp5rUNhUttKx2yzgU8UGtc": {
    name: "XAG",
    denomination: 100_000_000,
    exponent: -3,
    isShortMarket: true,
    baseMarket: "Caqzhuj2Hj5MUwQigdtLNokLZbuqs6NrcmwWbMsSqwqH",
  },
  // Add more market mappings as needed
};


/**
 * Gets market information by market address
 * @param marketAddress The Solana market address
 * @returns MarketInfo or undefined if market not found
 */
export const getMarketInfo = (
  marketAddress: string
): MarketInfo | undefined => {
  return MARKETS[marketAddress];
};

/**
 * Gets market name by market address
 * @param marketAddress The Solana market address
 * @returns Market name or the address if market not found
 */
export const getMarketName = (marketAddress: string): string => {
  const marketInfo = MARKETS[marketAddress];
  return marketInfo ? marketInfo.name : marketAddress;
};
