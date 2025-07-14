interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: string;
  lastUpdated: Date;
}

interface MarketDataProvider {
  name: string;
  fetchPrice: (symbol: string) => Promise<StockQuote>;
  fetchMultiplePrices: (symbols: string[]) => Promise<Map<string, StockQuote>>;
}

// Simple in-memory cache with 5-minute expiry
class PriceCache {
  private cache = new Map<string, { data: StockQuote; expiry: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  set(symbol: string, data: StockQuote): void {
    this.cache.set(symbol, {
      data,
      expiry: Date.now() + this.CACHE_DURATION,
    });
  }

  get(symbol: string): StockQuote | null {
    const cached = this.cache.get(symbol);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }
    this.cache.delete(symbol);
    return null;
  }

  clear(): void {
    this.cache.clear();
  }
}

// Yahoo Finance API Provider (Free, no API key required)
class YahooFinanceProvider implements MarketDataProvider {
  name = "Yahoo Finance";

  async fetchPrice(symbol: string): Promise<StockQuote> {
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
      console.log(
        `Fetching real-time data for ${symbol} from Yahoo Finance...`
      );

      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      if (!response.ok) {
        throw new Error(`Yahoo Finance API error: ${response.status}`);
      }

      const data = await response.json();
      const result = data?.chart?.result?.[0];

      if (!result) {
        throw new Error(`No data found for symbol ${symbol}`);
      }

      const meta = result.meta;
      const quote = result.indicators?.quote?.[0];

      if (!meta || !quote) {
        throw new Error(`Invalid data structure for ${symbol}`);
      }

      const currentPrice = meta.regularMarketPrice || meta.previousClose;
      const previousClose = meta.previousClose;
      const change = currentPrice - previousClose;
      const changePercent = (change / previousClose) * 100;

      return {
        symbol: symbol.toUpperCase(),
        price: currentPrice,
        change: change,
        changePercent: changePercent,
        volume: meta.regularMarketVolume || 0,
        marketCap: this.formatMarketCap(meta.marketCap),
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error(`Yahoo Finance error for ${symbol}:`, error);
      throw new Error(`Failed to fetch ${symbol} from Yahoo Finance: ${error}`);
    }
  }

  async fetchMultiplePrices(
    symbols: string[]
  ): Promise<Map<string, StockQuote>> {
    const results = new Map<string, StockQuote>();

    // Process in batches to avoid rate limiting
    const batchSize = 5;
    for (let i = 0; i < symbols.length; i += batchSize) {
      const batch = symbols.slice(i, i + batchSize);
      const promises = batch.map((symbol) =>
        this.fetchPrice(symbol).catch((error) => {
          console.warn(`Failed to fetch ${symbol}:`, error);
          return null;
        })
      );

      const batchResults = await Promise.all(promises);
      batchResults.forEach((quote, index) => {
        if (quote) {
          results.set(batch[index], quote);
        }
      });

      // Small delay between batches
      if (i + batchSize < symbols.length) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }

    return results;
  }

  private formatMarketCap(marketCap: number | undefined): string {
    if (!marketCap) return "N/A";

    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    }
    return `$${marketCap.toLocaleString()}`;
  }
}

// Alpha Vantage Provider (Backup option with API key)
class AlphaVantageProvider implements MarketDataProvider {
  name = "Alpha Vantage";
  private apiKey: string;

  constructor(apiKey: string = "demo") {
    this.apiKey = apiKey;
  }

  async fetchPrice(symbol: string): Promise<StockQuote> {
    try {
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.apiKey}`;
      console.log(
        `Fetching real-time data for ${symbol} from Alpha Vantage...`
      );

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Alpha Vantage API error: ${response.status}`);
      }

      const data = await response.json();
      const quote = data["Global Quote"];

      if (!quote || Object.keys(quote).length === 0) {
        throw new Error(`No data found for symbol ${symbol}`);
      }

      const price = parseFloat(quote["05. price"]);
      const change = parseFloat(quote["09. change"]);
      const changePercent = parseFloat(
        quote["10. change percent"].replace("%", "")
      );

      return {
        symbol: symbol.toUpperCase(),
        price: price,
        change: change,
        changePercent: changePercent,
        volume: parseInt(quote["06. volume"]) || 0,
        marketCap: "N/A", // Alpha Vantage basic doesn't include market cap
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error(`Alpha Vantage error for ${symbol}:`, error);
      throw new Error(`Failed to fetch ${symbol} from Alpha Vantage: ${error}`);
    }
  }

  async fetchMultiplePrices(
    symbols: string[]
  ): Promise<Map<string, StockQuote>> {
    const results = new Map<string, StockQuote>();

    // Alpha Vantage has stricter rate limits (5 requests per minute for free tier)
    for (const symbol of symbols) {
      try {
        const quote = await this.fetchPrice(symbol);
        results.set(symbol, quote);
        // Rate limiting delay
        await new Promise((resolve) => setTimeout(resolve, 12000)); // 12 seconds between requests
      } catch (error) {
        console.warn(`Failed to fetch ${symbol} from Alpha Vantage:`, error);
      }
    }

    return results;
  }
}

// Main Market Data Service with fallback providers
export class MarketDataService {
  private cache = new PriceCache();
  private providers: MarketDataProvider[];
  private primaryProvider: MarketDataProvider;

  constructor(alphaVantageApiKey?: string) {
    this.providers = [
      new YahooFinanceProvider(),
      new AlphaVantageProvider(alphaVantageApiKey),
    ];
    this.primaryProvider = this.providers[0]; // Default to Yahoo Finance
  }

  async getStockPrice(symbol: string): Promise<StockQuote> {
    // Check cache first
    const cached = this.cache.get(symbol);
    if (cached) {
      console.log(`Using cached data for ${symbol}`);
      return cached;
    }

    // Try primary provider first
    try {
      const quote = await this.primaryProvider.fetchPrice(symbol);
      this.cache.set(symbol, quote);
      return quote;
    } catch (error) {
      console.warn(`Primary provider failed for ${symbol}, trying fallback...`);
    }

    // Try fallback providers
    for (let i = 1; i < this.providers.length; i++) {
      try {
        const quote = await this.providers[i].fetchPrice(symbol);
        this.cache.set(symbol, quote);
        return quote;
      } catch (error) {
        console.warn(
          `Provider ${this.providers[i].name} failed for ${symbol}:`,
          error
        );
      }
    }

    // If all providers fail, throw error
    throw new Error(`Failed to fetch price for ${symbol} from all providers`);
  }

  async getMultipleStockPrices(
    symbols: string[]
  ): Promise<Map<string, StockQuote>> {
    console.log(`Fetching real-time market data for:`, symbols);

    const results = new Map<string, StockQuote>();
    const uncachedSymbols: string[] = [];

    // Check cache for each symbol
    for (const symbol of symbols) {
      const cached = this.cache.get(symbol);
      if (cached) {
        results.set(symbol, cached);
      } else {
        uncachedSymbols.push(symbol);
      }
    }

    if (uncachedSymbols.length === 0) {
      console.log(`All data served from cache`);
      return results;
    }

    // Fetch uncached symbols
    try {
      const newQuotes = await this.primaryProvider.fetchMultiplePrices(
        uncachedSymbols
      );
      for (const [symbol, quote] of newQuotes) {
        this.cache.set(symbol, quote);
        results.set(symbol, quote);
      }
    } catch (error) {
      console.warn(
        `Primary provider failed for batch fetch, trying individual fetches...`
      );

      // Fallback to individual fetches for remaining symbols
      for (const symbol of uncachedSymbols) {
        if (!results.has(symbol)) {
          try {
            const quote = await this.getStockPrice(symbol);
            results.set(symbol, quote);
          } catch (error) {
            console.error(`Failed to fetch ${symbol}:`, error);
          }
        }
      }
    }

    return results;
  }

  clearCache(): void {
    this.cache.clear();
  }

  switchProvider(providerName: string): boolean {
    const provider = this.providers.find((p) => p.name === providerName);
    if (provider) {
      this.primaryProvider = provider;
      console.log(`Switched to ${providerName} as primary provider`);
      return true;
    }
    return false;
  }

  getProviderNames(): string[] {
    return this.providers.map((p) => p.name);
  }
}

// Create singleton instance
export const marketDataService = new MarketDataService();

// Export types for use in other modules
export { StockQuote };
