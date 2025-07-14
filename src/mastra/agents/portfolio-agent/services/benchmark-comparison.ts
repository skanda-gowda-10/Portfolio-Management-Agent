interface BenchmarkData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  ytdReturn?: number;
  volume: number;
  lastUpdated: Date;
}

interface PortfolioPerformance {
  totalValue: number;
  totalReturn: number;
  totalReturnPercent: number;
  dailyChange: number;
  dailyChangePercent: number;
}

interface BenchmarkComparison {
  portfolioPerformance: PortfolioPerformance;
  benchmarks: BenchmarkData[];
  comparisons: {
    benchmark: string;
    portfolioReturn: number;
    benchmarkReturn: number;
    outperformance: number;
    relativePerformance: string;
  }[];
  summary: {
    bestPerforming: string;
    worstPerforming: string;
    portfolioRank: number;
    totalBenchmarks: number;
  };
}

// Major market benchmarks to track
const MAJOR_BENCHMARKS = [
  { symbol: "SPY", name: "S&P 500 ETF", description: "Large-cap US stocks" },
  {
    symbol: "QQQ",
    name: "NASDAQ-100 ETF",
    description: "Technology-heavy index",
  },
  {
    symbol: "DIA",
    name: "Dow Jones ETF",
    description: "30 large US companies",
  },
  {
    symbol: "IWM",
    name: "Russell 2000 ETF",
    description: "Small-cap US stocks",
  },
  {
    symbol: "VTI",
    name: "Total Stock Market ETF",
    description: "Entire US stock market",
  },
  {
    symbol: "VXUS",
    name: "International Stocks ETF",
    description: "International developed markets",
  },
  {
    symbol: "VEA",
    name: "Developed Markets ETF",
    description: "European and Asian markets",
  },
  {
    symbol: "VWO",
    name: "Emerging Markets ETF",
    description: "Emerging market stocks",
  },
  {
    symbol: "BND",
    name: "Total Bond Market ETF",
    description: "US bond market",
  },
  { symbol: "GLD", name: "Gold ETF", description: "Gold commodity" },
];

export class BenchmarkComparisonService {
  private marketDataService: any;

  constructor(marketDataService: any) {
    this.marketDataService = marketDataService;
  }

  async compareToBenchmarks(
    portfolioHoldings: any[],
    portfolioValue: number,
    originalInvestment?: number
  ): Promise<BenchmarkComparison> {
    try {
      console.log("📊 Fetching benchmark data for comparison...");

      // Fetch current portfolio data
      const portfolioSymbols = portfolioHoldings.map((h) => h.symbol);
      const portfolioQuotes =
        await this.marketDataService.getMultipleStockPrices(portfolioSymbols);

      // Calculate current portfolio performance
      const portfolioPerformance = this.calculatePortfolioPerformance(
        portfolioHoldings,
        portfolioQuotes,
        portfolioValue,
        originalInvestment
      );

      // Fetch benchmark data
      const benchmarkSymbols = MAJOR_BENCHMARKS.map((b) => b.symbol);
      const benchmarkQuotes =
        await this.marketDataService.getMultipleStockPrices(benchmarkSymbols);

      // Process benchmark data
      const benchmarks = MAJOR_BENCHMARKS.map((benchmark) => {
        const quote = benchmarkQuotes.get(benchmark.symbol);
        if (!quote) {
          return {
            symbol: benchmark.symbol,
            name: benchmark.name,
            price: 0,
            change: 0,
            changePercent: 0,
            ytdReturn: 0,
            volume: 0,
            lastUpdated: new Date(),
          };
        }

        return {
          symbol: benchmark.symbol,
          name: benchmark.name,
          price: quote.price,
          change: quote.change,
          changePercent: quote.changePercent,
          ytdReturn: this.estimateYTDReturn(quote.changePercent),
          volume: quote.volume,
          lastUpdated: quote.lastUpdated,
        };
      }).filter((b) => b.price > 0); // Filter out failed fetches

      // Create comparisons - provide both daily and total return comparisons
      const comparisons = benchmarks.map((benchmark) => {
        // Daily performance comparison (apples to apples)
        const dailyOutperformance =
          portfolioPerformance.dailyChangePercent - benchmark.changePercent;

        // Estimated total return comparison (rough approximation)
        const benchmarkEstimatedTotal =
          benchmark.ytdReturn || benchmark.changePercent;
        const totalOutperformance =
          portfolioPerformance.totalReturnPercent - benchmarkEstimatedTotal;

        return {
          benchmark: benchmark.name,
          portfolioReturn: portfolioPerformance.totalReturnPercent,
          benchmarkReturn: benchmarkEstimatedTotal,
          outperformance: totalOutperformance,
          relativePerformance:
            this.getRelativePerformanceDescription(totalOutperformance),
          // Add daily comparison for context
          portfolioDailyReturn: portfolioPerformance.dailyChangePercent,
          benchmarkDailyReturn: benchmark.changePercent,
          dailyOutperformance: dailyOutperformance,
          dailyRelativePerformance:
            this.getRelativePerformanceDescription(dailyOutperformance),
        };
      });

      // Calculate summary statistics
      const summary = this.calculateSummary(
        portfolioPerformance,
        benchmarks,
        comparisons
      );

      return {
        portfolioPerformance,
        benchmarks,
        comparisons,
        summary,
      };
    } catch (error) {
      console.error("Benchmark comparison error:", error);
      throw new Error(
        `Failed to compare benchmarks: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  private calculatePortfolioPerformance(
    holdings: any[],
    quotes: Map<string, any>,
    currentValue: number,
    originalInvestment?: number
  ): PortfolioPerformance {
    let totalCalculatedValue = 0;
    let totalDailyChange = 0;
    let totalOriginalValue = originalInvestment || 0;

    // Calculate current values and daily changes from individual holdings
    holdings.forEach((holding) => {
      const quote = quotes.get(holding.symbol);
      if (quote) {
        const currentPositionValue = holding.quantity * quote.price;
        const dailyPositionChange = holding.quantity * quote.change;

        totalCalculatedValue += currentPositionValue;
        totalDailyChange += dailyPositionChange;

        if (!originalInvestment) {
          // If no original investment provided, estimate based on average cost
          totalOriginalValue +=
            holding.quantity * (holding.averageCost || quote.price);
        }
      }
    });

    // Use provided currentValue if it's more accurate than calculated value
    const portfolioValue =
      currentValue > 0 ? currentValue : totalCalculatedValue;

    // Calculate total return correctly
    const totalReturn = portfolioValue - totalOriginalValue;
    const totalReturnPercent =
      totalOriginalValue > 0 ? (totalReturn / totalOriginalValue) * 100 : 0;

    // Calculate daily change percentage correctly
    // dailyChange / (portfolioValue - dailyChange) gives the % change from yesterday's value
    const yesterdayValue = portfolioValue - totalDailyChange;
    const dailyChangePercent =
      yesterdayValue > 0 ? (totalDailyChange / yesterdayValue) * 100 : 0;

    console.log(`📊 Portfolio Performance Calculation:
    - Current Value: $${portfolioValue.toFixed(2)}
    - Original Investment: $${totalOriginalValue.toFixed(2)}
    - Total Return: $${totalReturn.toFixed(2)} (${totalReturnPercent.toFixed(
      2
    )}%)
    - Daily Change: $${totalDailyChange.toFixed(
      2
    )} (${dailyChangePercent.toFixed(2)}%)
    - Yesterday Value: $${yesterdayValue.toFixed(2)}`);

    return {
      totalValue: portfolioValue,
      totalReturn: totalReturn,
      totalReturnPercent: Math.round(totalReturnPercent * 100) / 100, // Round to 2 decimal places
      dailyChange: totalDailyChange,
      dailyChangePercent: Math.round(dailyChangePercent * 100) / 100, // Round to 2 decimal places
    };
  }

  private estimateYTDReturn(currentDayChange: number): number {
    // Rough estimation: assume current day change is representative
    // In a real implementation, you'd fetch historical YTD data
    const tradingDaysYTD =
      Math.floor(
        (Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) /
          (1000 * 60 * 60 * 24)
      ) * 0.7; // ~70% of days are trading days
    return currentDayChange * Math.sqrt(tradingDaysYTD / 252); // Annualized estimate
  }

  private getRelativePerformanceDescription(outperformance: number): string {
    if (outperformance > 5) return "Significantly outperforming";
    if (outperformance > 2) return "Outperforming";
    if (outperformance > -2) return "Performing similarly";
    if (outperformance > -5) return "Underperforming";
    return "Significantly underperforming";
  }

  private calculateSummary(
    portfolioPerformance: PortfolioPerformance,
    benchmarks: BenchmarkData[],
    comparisons: any[]
  ) {
    // Find best and worst performing benchmarks
    const sortedBenchmarks = [...benchmarks].sort(
      (a, b) => b.changePercent - a.changePercent
    );
    const bestPerforming = sortedBenchmarks[0]?.name || "N/A";
    const worstPerforming =
      sortedBenchmarks[sortedBenchmarks.length - 1]?.name || "N/A";

    // Calculate portfolio rank
    const allReturns = [
      portfolioPerformance.totalReturnPercent,
      ...benchmarks.map((b) => b.changePercent),
    ].sort((a, b) => b - a);
    const portfolioRank =
      allReturns.indexOf(portfolioPerformance.totalReturnPercent) + 1;

    return {
      bestPerforming,
      worstPerforming,
      portfolioRank,
      totalBenchmarks: benchmarks.length + 1, // +1 for portfolio
    };
  }

  async getDetailedBenchmarkAnalysis(symbol: string): Promise<any> {
    try {
      // Fetch detailed data for a specific benchmark
      const quote = await this.marketDataService.getStockPrice(symbol);

      return {
        symbol: quote.symbol,
        price: quote.price,
        change: quote.change,
        changePercent: quote.changePercent,
        volume: quote.volume,
        marketCap: quote.marketCap,
        analysis: this.generateBenchmarkAnalysis(quote),
      };
    } catch (error) {
      console.error(`Failed to get detailed analysis for ${symbol}:`, error);
      throw error;
    }
  }

  private generateBenchmarkAnalysis(quote: any): string {
    const performance = quote.changePercent;
    let analysis = `${quote.symbol} is `;

    if (performance > 2) {
      analysis +=
        "showing strong positive momentum with significant gains today.";
    } else if (performance > 0.5) {
      analysis += "performing well with moderate gains.";
    } else if (performance > -0.5) {
      analysis += "trading relatively flat with minimal movement.";
    } else if (performance > -2) {
      analysis += "experiencing moderate decline.";
    } else {
      analysis += "under significant selling pressure with notable losses.";
    }

    // Add volume analysis
    if (quote.volume > 1000000) {
      analysis +=
        " Trading volume is elevated, indicating increased investor interest.";
    }

    return analysis;
  }

  getBenchmarkList(): typeof MAJOR_BENCHMARKS {
    return MAJOR_BENCHMARKS;
  }
}
