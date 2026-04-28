/**
 * Market Agent
 * Fetches cryptocurrency prices from CoinGecko API
 */

interface PriceData {
  symbol: string;
  name: string;
  currentPrice: number;
  priceChange24h: number;
  marketCap: number;
  volume24h: number;
}

interface MarketData {
  timestamp: string;
  prices: {
    BTC: PriceData;
    ETH: PriceData;
    USDT: PriceData;
  };
  success: boolean;
  error?: string;
}

/**
 * Fetch prices for BTC, ETH, USDT from CoinGecko
 */
export async function fetchMarketPrices(): Promise<MarketData> {
  const timestamp = new Date().toISOString();

  try {
    // CoinGecko API endpoint for multiple coins
    const coinIds = "bitcoin,ethereum,tether";
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Transform CoinGecko response to our format
    const marketData: MarketData = {
      timestamp,
      prices: {
        BTC: {
          symbol: "BTC",
          name: "Bitcoin",
          currentPrice: data.bitcoin?.usd || 0,
          priceChange24h: data.bitcoin?.usd_24h_change || 0,
          marketCap: data.bitcoin?.usd_market_cap || 0,
          volume24h: data.bitcoin?.usd_24h_vol || 0,
        },
        ETH: {
          symbol: "ETH",
          name: "Ethereum",
          currentPrice: data.ethereum?.usd || 0,
          priceChange24h: data.ethereum?.usd_24h_change || 0,
          marketCap: data.ethereum?.usd_market_cap || 0,
          volume24h: data.ethereum?.usd_24h_vol || 0,
        },
        USDT: {
          symbol: "USDT",
          name: "Tether",
          currentPrice: data.tether?.usd || 1,
          priceChange24h: data.tether?.usd_24h_change || 0,
          marketCap: data.tether?.usd_market_cap || 0,
          volume24h: data.tether?.usd_24h_vol || 0,
        },
      },
      success: true,
    };

    return marketData;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    console.error("Market Agent Error:", errorMessage);

    // Return fallback data with error flag
    return {
      timestamp,
      prices: {
        BTC: {
          symbol: "BTC",
          name: "Bitcoin",
          currentPrice: 0,
          priceChange24h: 0,
          marketCap: 0,
          volume24h: 0,
        },
        ETH: {
          symbol: "ETH",
          name: "Ethereum",
          currentPrice: 0,
          priceChange24h: 0,
          marketCap: 0,
          volume24h: 0,
        },
        USDT: {
          symbol: "USDT",
          name: "Tether",
          currentPrice: 1,
          priceChange24h: 0,
          marketCap: 0,
          volume24h: 0,
        },
      },
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Get market data with caching to avoid rate limits
 */
let cachedMarketData: MarketData | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 60000; // 60 seconds

export async function getMarketData(): Promise<MarketData> {
  const now = Date.now();

  // Return cached data if available and not expired
  if (cachedMarketData && now - lastFetchTime < CACHE_DURATION) {
    return cachedMarketData;
  }

  // Fetch fresh data
  cachedMarketData = await fetchMarketPrices();
  lastFetchTime = now;

  return cachedMarketData;
}

/**
 * Get individual asset price
 */
export async function getAssetPrice(
  symbol: "BTC" | "ETH" | "USDT",
): Promise<PriceData | null> {
  try {
    const marketData = await getMarketData();

    if (!marketData.success) {
      console.warn(`Failed to get price for ${symbol}`);
      return null;
    }

    return marketData.prices[symbol] || null;
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error);
    return null;
  }
}
