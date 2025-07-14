import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { marketDataService, StockQuote } from "../services/market-data";

export const realTimePrices = createTool({
  id: "get-real-time-prices",
  description:
    "Get real-time stock prices and market data for individual symbols or watchlists",
  inputSchema: z.object({
    symbols: z
      .array(z.string())
      .describe(
        "Array of stock symbols to get prices for (e.g., ['AAPL', 'MSFT', 'GOOGL'])"
      ),
    detailed: z
      .boolean()
      .optional()
      .default(false)
      .describe(
        "Whether to include detailed market information (volume, market cap, etc.)"
      ),
  }),
  outputSchema: z.object({
    quotes: z.array(
      z.object({
        symbol: z.string(),
        price: z.number(),
        change: z.number(),
        changePercent: z.number(),
        volume: z.number().optional(),
        marketCap: z.string().optional(),
        lastUpdated: z.string(),
        status: z.enum(["success", "error"]),
        errorMessage: z.string().optional(),
      })
    ),
    summary: z.object({
      totalSymbols: z.number(),
      successful: z.number(),
      failed: z.number(),
      lastUpdated: z.string(),
    }),
    marketSummary: z.string(),
  }),
  execute: async ({ context }) => {
    // Handle undefined or malformed context
    if (!context) {
      throw new Error(
        "Please specify which stock symbols you'd like to get prices for."
      );
    }

    // If context is a string, try to extract symbols
    if (typeof context === "string") {
      throw new Error(
        "Please provide an array of stock symbols like: ['AAPL', 'MSFT', 'GOOGL']"
      );
    }

    return await fetchRealTimePrices(context);
  },
});

const fetchRealTimePrices = async (request: any) => {
  const { symbols = [], detailed = false } = request;

  if (symbols.length === 0) {
    throw new Error("No symbols provided for price lookup");
  }

  // Validate and clean symbols
  const cleanSymbols = symbols
    .map((s: string) => s.toString().toUpperCase().trim())
    .filter((s: string) => s.length > 0);

  if (cleanSymbols.length === 0) {
    throw new Error("No valid symbols provided");
  }

  console.log(`Fetching real-time prices for: [${cleanSymbols.join(", ")}]`);

  const quotes: any[] = [];
  let successful = 0;
  let failed = 0;

  try {
    const marketData = await marketDataService.getMultipleStockPrices(
      cleanSymbols
    );

    // Process each requested symbol
    for (const symbol of cleanSymbols) {
      const quote = marketData.get(symbol);

      if (quote) {
        quotes.push({
          symbol: quote.symbol,
          price: Math.round(quote.price * 100) / 100,
          change: Math.round(quote.change * 100) / 100,
          changePercent: Math.round(quote.changePercent * 100) / 100,
          ...(detailed && {
            volume: quote.volume,
            marketCap: quote.marketCap,
          }),
          lastUpdated: quote.lastUpdated.toISOString(),
          status: "success" as const,
        });
        successful++;
      } else {
        quotes.push({
          symbol: symbol,
          price: 0,
          change: 0,
          changePercent: 0,
          ...(detailed && {
            volume: 0,
            marketCap: "N/A",
          }),
          lastUpdated: new Date().toISOString(),
          status: "error" as const,
          errorMessage: `Unable to fetch data for ${symbol}`,
        });
        failed++;
      }
    }

    // Generate market summary
    const marketSummary = generateMarketSummary(
      quotes.filter((q) => q.status === "success")
    );

    return {
      quotes,
      summary: {
        totalSymbols: cleanSymbols.length,
        successful,
        failed,
        lastUpdated: new Date().toISOString(),
      },
      marketSummary,
    };
  } catch (error) {
    console.error("Real-time prices error:", error);

    // Return error response for all symbols
    const errorQuotes = cleanSymbols.map((symbol) => ({
      symbol,
      price: 0,
      change: 0,
      changePercent: 0,
      ...(detailed && {
        volume: 0,
        marketCap: "N/A",
      }),
      lastUpdated: new Date().toISOString(),
      status: "error" as const,
      errorMessage: `Market data service error: ${error}`,
    }));

    return {
      quotes: errorQuotes,
      summary: {
        totalSymbols: cleanSymbols.length,
        successful: 0,
        failed: cleanSymbols.length,
        lastUpdated: new Date().toISOString(),
      },
      marketSummary:
        "Unable to generate market summary due to data retrieval errors.",
    };
  }
};

const generateMarketSummary = (successfulQuotes: any[]): string => {
  if (successfulQuotes.length === 0) {
    return "No market data available for analysis.";
  }

  const gainers = successfulQuotes.filter((q) => q.changePercent > 0);
  const decliners = successfulQuotes.filter((q) => q.changePercent < 0);
  const unchanged = successfulQuotes.filter((q) => q.changePercent === 0);

  const topGainer =
    gainers.length > 0
      ? gainers.reduce((max, current) =>
          current.changePercent > max.changePercent ? current : max
        )
      : null;

  const topDecliner =
    decliners.length > 0
      ? decliners.reduce((min, current) =>
          current.changePercent < min.changePercent ? current : min
        )
      : null;

  const avgChange =
    successfulQuotes.length > 0
      ? successfulQuotes.reduce((sum, q) => sum + q.changePercent, 0) /
        successfulQuotes.length
      : 0;

  let summary = `Market Overview: ${gainers.length} gaining, ${decliners.length} declining, ${unchanged.length} unchanged. `;
  summary += `Average change: ${avgChange.toFixed(2)}%. `;

  if (topGainer) {
    summary += `Top performer: ${
      topGainer.symbol
    } (+${topGainer.changePercent.toFixed(2)}%). `;
  }

  if (topDecliner) {
    summary += `Biggest decliner: ${
      topDecliner.symbol
    } (${topDecliner.changePercent.toFixed(2)}%). `;
  }

  // Market sentiment
  const bullishSentiment = gainers.length / successfulQuotes.length;
  if (bullishSentiment > 0.7) {
    summary += "Strong bullish sentiment across your watchlist.";
  } else if (bullishSentiment > 0.5) {
    summary += "Moderately positive market sentiment.";
  } else if (bullishSentiment > 0.3) {
    summary += "Mixed market sentiment with bearish bias.";
  } else {
    summary += "Strong bearish sentiment across your watchlist.";
  }

  return summary;
};

// Convenience tool for getting a single stock price
export const singleStockPrice = createTool({
  id: "get-single-stock-price",
  description: "Get real-time price data for a single stock symbol",
  inputSchema: z.object({
    symbol: z.string().describe("Stock symbol to get price for (e.g., 'AAPL')"),
  }),
  outputSchema: z.object({
    symbol: z.string(),
    price: z.number(),
    change: z.number(),
    changePercent: z.number(),
    volume: z.number(),
    marketCap: z.string(),
    lastUpdated: z.string(),
    priceHistory: z
      .object({
        dayHigh: z.number().optional(),
        dayLow: z.number().optional(),
        fiftyTwoWeekHigh: z.number().optional(),
        fiftyTwoWeekLow: z.number().optional(),
      })
      .optional(),
    technicalIndicators: z
      .object({
        rsi: z.number().optional(),
        movingAverage50: z.number().optional(),
        movingAverage200: z.number().optional(),
      })
      .optional(),
  }),
  execute: async ({ context }) => {
    // Handle undefined or malformed context
    if (!context) {
      throw new Error("Please specify a stock symbol to get the price for.");
    }

    // If context is not an object with symbol property
    if (typeof context !== "object" || !context.symbol) {
      throw new Error("Please provide a stock symbol like: 'AAPL' or 'MSFT'");
    }

    return await fetchSingleStockPrice(context);
  },
});

const fetchSingleStockPrice = async (request: any) => {
  const { symbol } = request;

  if (!symbol || typeof symbol !== "string") {
    throw new Error("Valid stock symbol is required");
  }

  const cleanSymbol = symbol.toUpperCase().trim();

  try {
    console.log(`Fetching detailed real-time data for: ${cleanSymbol}`);
    const quote = await marketDataService.getStockPrice(cleanSymbol);

    return {
      symbol: quote.symbol,
      price: Math.round(quote.price * 100) / 100,
      change: Math.round(quote.change * 100) / 100,
      changePercent: Math.round(quote.changePercent * 100) / 100,
      volume: quote.volume,
      marketCap: quote.marketCap,
      lastUpdated: quote.lastUpdated.toISOString(),
      // Note: These would require additional API calls to different endpoints
      // For now, marking as optional and could be enhanced later
      priceHistory: {
        // dayHigh: // Would need daily OHLC data
        // dayLow: // Would need daily OHLC data
      },
      technicalIndicators: {
        // rsi: // Would need historical price data calculation
        // movingAverage50: // Would need 50-day historical data
        // movingAverage200: // Would need 200-day historical data
      },
    };
  } catch (error) {
    console.error(`Single stock price error for ${cleanSymbol}:`, error);
    throw new Error(`Failed to fetch price for ${cleanSymbol}: ${error}`);
  }
};
 