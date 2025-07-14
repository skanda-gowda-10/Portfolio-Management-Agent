import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { BenchmarkComparisonService } from "../services/benchmark-comparison";
import { marketDataService } from "../services/market-data";

// Initialize services
const benchmarkComparisonService = new BenchmarkComparisonService(
  marketDataService
);

export const benchmarkComparison = createTool({
  id: "compare-to-benchmarks",
  description:
    "Compare portfolio performance against major market indices and benchmarks including S&P 500, NASDAQ, Dow Jones, and international markets",
  inputSchema: z.object({
    holdings: z
      .array(
        z.object({
          symbol: z.string().describe("Stock symbol (e.g., AAPL)"),
          quantity: z.number().describe("Number of shares owned"),
          averageCost: z.number().optional().describe("Average cost per share"),
        })
      )
      .describe("Current portfolio holdings"),
    portfolioValue: z.number().describe("Current total portfolio value"),
    originalInvestment: z
      .number()
      .optional()
      .describe("Original investment amount (for return calculation)"),
  }),
  outputSchema: z.object({
    portfolioPerformance: z.object({
      totalValue: z.number().describe("Current portfolio value"),
      totalReturn: z.number().describe("Total profit/loss amount"),
      totalReturnPercent: z.number().describe("Total return percentage"),
      dailyChange: z.number().describe("Today's dollar change"),
      dailyChangePercent: z.number().describe("Today's percentage change"),
    }),
    benchmarkComparisons: z
      .array(
        z.object({
          benchmark: z.string().describe("Benchmark name"),
          portfolioReturn: z.number().describe("Portfolio total return %"),
          benchmarkReturn: z
            .number()
            .describe("Benchmark estimated total return %"),
          outperformance: z.number().describe("Total return outperformance %"),
          relativePerformance: z
            .string()
            .describe("Total performance description"),
          portfolioDailyReturn: z.number().describe("Portfolio daily return %"),
          benchmarkDailyReturn: z.number().describe("Benchmark daily return %"),
          dailyOutperformance: z.number().describe("Daily outperformance %"),
          dailyRelativePerformance: z
            .string()
            .describe("Daily performance description"),
        })
      )
      .describe(
        "Detailed comparison with each benchmark including both daily and total returns"
      ),
    benchmarkData: z
      .array(
        z.object({
          symbol: z.string(),
          name: z.string(),
          price: z.number(),
          change: z.number(),
          changePercent: z.number(),
          volume: z.number(),
        })
      )
      .describe("Current benchmark market data"),
    summary: z.object({
      portfolioRank: z.number().describe("Portfolio rank among all assets"),
      totalBenchmarks: z.number().describe("Total number of benchmarks"),
      bestPerforming: z.string().describe("Best performing benchmark"),
      worstPerforming: z.string().describe("Worst performing benchmark"),
      overallAssessment: z.string().describe("Overall performance assessment"),
    }),
    insights: z.array(z.string()).describe("Key performance insights"),
    recommendations: z.array(z.string()).describe("Strategic recommendations"),
  }),
  execute: async ({ context }) => {
    if (!context || typeof context !== "object") {
      throw new Error(
        "Portfolio data required for benchmark comparison. Please provide holdings and portfolio value."
      );
    }

    const { holdings, portfolioValue, originalInvestment } = context;

    if (!holdings || !Array.isArray(holdings) || holdings.length === 0) {
      throw new Error(
        "At least one holding is required for benchmark comparison."
      );
    }

    if (!portfolioValue || portfolioValue <= 0) {
      throw new Error(
        "Valid portfolio value is required for benchmark comparison."
      );
    }

    try {
      console.log("📊 Running benchmark comparison analysis...");

      const comparisonResult =
        await benchmarkComparisonService.compareToBenchmarks(
          holdings,
          portfolioValue,
          originalInvestment
        );

      // Generate insights and recommendations
      const insights = generatePerformanceInsights(comparisonResult);
      const recommendations =
        generateStrategicRecommendations(comparisonResult);
      const overallAssessment = generateOverallAssessment(comparisonResult);

      console.log("✅ Benchmark comparison completed successfully!");

      return {
        portfolioPerformance: comparisonResult.portfolioPerformance,
        benchmarkComparisons: comparisonResult.comparisons,
        benchmarkData: comparisonResult.benchmarks.map((b) => ({
          symbol: b.symbol,
          name: b.name,
          price: b.price,
          change: b.change,
          changePercent: b.changePercent,
          volume: b.volume,
        })),
        summary: {
          ...comparisonResult.summary,
          overallAssessment,
        },
        insights,
        recommendations,
      };
    } catch (error) {
      console.error("Benchmark comparison error:", error);
      throw new Error(
        `Benchmark comparison failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },
});

function generatePerformanceInsights(result: any): string[] {
  const insights = [];
  const { portfolioPerformance, comparisons, summary } = result;

  // Performance ranking insight
  if (summary.portfolioRank === 1) {
    insights.push(
      "🏆 Outstanding performance! Your portfolio is outperforming all major market indices."
    );
  } else if (summary.portfolioRank <= 3) {
    insights.push(
      `🎯 Excellent performance! Your portfolio ranks #${summary.portfolioRank} among major market indices.`
    );
  } else if (summary.portfolioRank <= summary.totalBenchmarks / 2) {
    insights.push(
      `📈 Above-average performance! Your portfolio ranks #${summary.portfolioRank} out of ${summary.totalBenchmarks} assets.`
    );
  } else {
    insights.push(
      `📊 Below-average performance. Your portfolio ranks #${summary.portfolioRank} out of ${summary.totalBenchmarks} assets.`
    );
  }

  // Daily performance insight
  if (portfolioPerformance.dailyChangePercent > 2) {
    insights.push("🚀 Strong daily performance with gains exceeding 2%.");
  } else if (portfolioPerformance.dailyChangePercent < -2) {
    insights.push(
      "⚠️ Significant daily decline - monitor for potential buying opportunities."
    );
  }

  // Comparison insights
  const outperformingCount = comparisons.filter(
    (c) => c.outperformance > 0
  ).length;
  const totalComparisons = comparisons.length;

  if (outperformingCount >= totalComparisons * 0.8) {
    insights.push(
      `💪 Strong relative performance - outperforming ${outperformingCount} out of ${totalComparisons} major indices.`
    );
  } else if (outperformingCount >= totalComparisons * 0.5) {
    insights.push(
      `✅ Balanced performance - competitive with major market indices.`
    );
  } else {
    insights.push(
      `🔍 Consider portfolio adjustments - underperforming majority of market indices.`
    );
  }

  // Volatility insight
  const avgBenchmarkChange =
    comparisons.reduce((sum, c) => sum + Math.abs(c.benchmarkReturn), 0) /
    comparisons.length;
  const portfolioVolatility = Math.abs(portfolioPerformance.dailyChangePercent);

  if (portfolioVolatility > avgBenchmarkChange * 1.5) {
    insights.push(
      "⚡ Higher volatility than market averages - consider diversification to reduce risk."
    );
  } else if (portfolioVolatility < avgBenchmarkChange * 0.5) {
    insights.push(
      "🛡️ Lower volatility than market averages - well-diversified, conservative portfolio."
    );
  }

  return insights;
}

function generateStrategicRecommendations(result: any): string[] {
  const recommendations = [];
  const { portfolioPerformance, comparisons, summary } = result;

  // Performance-based recommendations
  if (summary.portfolioRank > summary.totalBenchmarks / 2) {
    recommendations.push(
      "Consider increasing exposure to market-leading sectors or adding index funds for broader market participation."
    );
  }

  // Diversification recommendations
  const spyComparison = comparisons.find((c) =>
    c.benchmark.includes("S&P 500")
  );
  if (spyComparison && spyComparison.outperformance < -5) {
    recommendations.push(
      "Consider adding S&P 500 exposure through SPY or similar ETF to capture broad market performance."
    );
  }

  const techComparison = comparisons.find((c) =>
    c.benchmark.includes("NASDAQ")
  );
  if (techComparison && techComparison.outperformance > 10) {
    recommendations.push(
      "Strong tech performance detected - consider taking some profits and rebalancing into other sectors."
    );
  }

  // International diversification
  const intlComparisons = comparisons.filter(
    (c) =>
      c.benchmark.includes("International") || c.benchmark.includes("Emerging")
  );
  if (intlComparisons.some((c) => c.outperformance < -3)) {
    recommendations.push(
      "Consider adding international exposure through VXUS or VEA to improve global diversification."
    );
  }

  // Risk management
  if (portfolioPerformance.dailyChangePercent < -3) {
    recommendations.push(
      "Significant daily losses detected - consider implementing stop-loss strategies or defensive positions."
    );
  }

  // Bond allocation
  const bondComparison = comparisons.find((c) => c.benchmark.includes("Bond"));
  if (
    bondComparison &&
    portfolioPerformance.dailyChangePercent < bondComparison.benchmarkReturn - 2
  ) {
    recommendations.push(
      "Consider adding bond exposure (BND) to reduce portfolio volatility and provide downside protection."
    );
  }

  // Default recommendations if none triggered
  if (recommendations.length === 0) {
    recommendations.push(
      "Portfolio performing well relative to benchmarks - maintain current allocation and continue monitoring."
    );
    recommendations.push(
      "Consider periodic rebalancing to maintain target allocations and manage risk."
    );
  }

  return recommendations;
}

function generateOverallAssessment(result: any): string {
  const { portfolioPerformance, summary, comparisons } = result;

  const outperformanceRatio =
    comparisons.filter((c) => c.outperformance > 0).length / comparisons.length;
  const totalReturnAbs = Math.abs(portfolioPerformance.totalReturnPercent);

  let assessment = "";

  if (summary.portfolioRank <= 2) {
    assessment =
      "Exceptional portfolio performance with strong outperformance across major indices.";
  } else if (summary.portfolioRank <= 4) {
    assessment =
      "Strong portfolio performance, consistently competitive with market leaders.";
  } else if (outperformanceRatio >= 0.6) {
    assessment = "Solid portfolio performance with good risk-adjusted returns.";
  } else if (outperformanceRatio >= 0.4) {
    assessment =
      "Mixed performance with room for optimization through diversification.";
  } else {
    assessment =
      "Portfolio underperforming major indices - consider strategic rebalancing.";
  }

  // Add context about return magnitude
  if (totalReturnAbs > 20) {
    assessment += " High-magnitude returns suggest elevated risk exposure.";
  } else if (totalReturnAbs > 10) {
    assessment += " Moderate return levels indicate balanced risk management.";
  } else {
    assessment += " Conservative return profile suggests low-risk positioning.";
  }

  return assessment;
}
