const COINGECKO_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  TON: "the-open-network",
  SOL: "solana",
  DOGE: "dogecoin",
  ADA: "cardano",
  XRP: "ripple",
  DOT: "polkadot",
  AVAX: "avalanche-2",
  MATIC: "matic-network",
  LINK: "chainlink",
  UNI: "uniswap",
  ATOM: "cosmos",
  LTC: "litecoin",
  BNB: "binancecoin",
  SHIB: "shiba-inu",
  APE: "apecoin",
  FIL: "filecoin",
  APT: "aptos",
  ARB: "arbitrum",
  OP: "optimism",
  NEAR: "near",
  FTM: "fantom",
  ALGO: "algorand",
  XTZ: "tezos",
  HBAR: "hedera-hashgraph",
  ICP: "internet-computer",
  VET: "vechain",
  THETA: "theta-token",
  XLM: "stellar",
};

const TIMEOUT_MS = 8000;

async function fetchWithTimeout(url: string, timeout = TIMEOUT_MS): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

export interface PriceQuote {
  ticker: string;
  price: number;
  change24h: number;
}

export async function fetchPrices(tickers: string[]): Promise<PriceQuote[]> {
  if (tickers.length === 0) return [];
  const ids = tickers
    .map((t) => COINGECKO_IDS[t.toUpperCase()] ?? null)
    .filter(Boolean);
  if (ids.length === 0) return [];
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(",")}&vs_currencies=usd&include_24hr_change=true`;
  const data = await fetchWithTimeout(url);
  return tickers
    .map((ticker) => {
      const id = COINGECKO_IDS[ticker.toUpperCase()];
      if (!id || !data[id]) return null;
      return {
        ticker: ticker.toUpperCase(),
        price: data[id].usd ?? 0,
        change24h: data[id].usd_24h_change ?? 0,
      };
    })
    .filter(Boolean) as PriceQuote[];
}

export async function validateTicker(ticker: string): Promise<boolean> {
  const upper = ticker.toUpperCase();
  if (COINGECKO_IDS[upper]) return true;
  try {
    const data = await fetchWithTimeout(
      `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(upper)}`,
    );
    return (
      data.coins?.some(
        (c: any) => c.symbol?.toUpperCase() === upper,
      ) ?? false
    );
  } catch {
    return false;
  }
}

export function getCoinGeckoId(ticker: string): string | null {
  return COINGECKO_IDS[ticker.toUpperCase()] ?? null;
}
