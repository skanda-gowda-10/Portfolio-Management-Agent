import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { portfolioOptimizerService } from "../services/portfolio-optimizer";

export const portfolioOptimizer = createTool({
  id: "optimize-portfolio",
  description:
    "Perform advanced portfolio optimization using Monte Carlo simulations, Modern Portfolio Theory, and efficient frontier analysis",
  inputSchema: z.object({
    holdings: z
      .array(
        z.object({
          symbol: z.string().describe("Stock symbol (e.g., AAPL)"),
          quantity: z.number().describe("Number of shares owned"),
          averageCost: z.number().describe("Average cost per share"),
        })
      )
      .describe("Current portfolio holdings"),
    totalValue: z.number().describe("Total portfolio value"),
    riskTolerance: z
      .enum(["conservative", "moderate", "aggressive", "very_aggressive"])
      .optional()
      .describe("Risk tolerance level for optimization"),
  }),
  outputSchema: z.object({
    optimization: z.object({
      optimalWeights: z
        .record(z.string(), z.number())
        .describe("Optimal portfolio weights"),
      efficientFrontier: z
        .array(
          z.object({
            risk: z.number(),
            return: z.number(),
            weights: z.record(z.string(), z.number()),
          })
        )
        .describe("Efficient frontier data points"),
      riskMetrics: z.object({
        expectedReturn: z.number().describe("Expected annual return (%)"),
        volatility: z.number().describe("Annual volatility (%)"),
        sharpeRatio: z.number().describe("Risk-adjusted return ratio"),
        maxDrawdown: z.number().describe("Maximum historical drawdown (%)"),
        valueAtRisk: z.number().describe("Value at Risk at 95% confidence (%)"),
        conditionalVaR: z.number().describe("Expected shortfall (%)"),
      }),
      monteCarloResults: z.object({
        scenarios: z.number().describe("Number of Monte Carlo scenarios"),
        successRate: z.number().describe("Probability of positive returns"),
        expectedFinalValue: z
          .number()
          .describe("Expected portfolio value after 1 year"),
        worstCase: z.number().describe("5th percentile outcome"),
        bestCase: z.number().describe("95th percentile outcome"),
      }),
      rebalanceRecommendations: z
        .array(
          z.object({
            symbol: z.string(),
            currentWeight: z.number(),
            targetWeight: z.number(),
            action: z.string(),
            amount: z.number(),
          })
        )
        .describe("Specific rebalancing recommendations"),
    }),
    summary: z.string().describe("Professional analysis summary"),
    insights: z.array(z.string()).describe("Key optimization insights"),
  }),
  execute: async ({ context }) => {
    if (!context || typeof context !== "object") {
      throw new Error(
        "Portfolio data required for optimization. Please provide holdings, total value, and risk tolerance."
      );
    }

    const { holdings, totalValue, riskTolerance = "moderate" } = context;

    if (!holdings || !Array.isArray(holdings) || holdings.length === 0) {
      throw new Error(
        "At least one holding is required for portfolio optimization."
      );
    }

    if (!totalValue || totalValue <= 0) {
      throw new Error(
        "Valid total portfolio value is required for optimization."
      );
    }

    try {
      console.log("🧠 Running advanced portfolio optimization...");

      const optimizationResult =
        await portfolioOptimizerService.optimizePortfolio(
          holdings,
          totalValue,
          riskTolerance
        );

      // Generate professional summary
      const summary = generateOptimizationSummary(
        optimizationResult,
        riskTolerance
      );

      // Generate key insights
      const insights = generateOptimizationInsights(
        optimizationResult,
        holdings
      );

      return {
        optimization: optimizationResult,
        summary,
        insights,
      };
    } catch (error) {
      console.error("Portfolio optimization error:", error);
      throw new Error(
        `Portfolio optimization failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },
});

function generateOptimizationSummary(
  result: any,
  riskTolerance: string
): string {
  const { riskMetrics, monteCarloResults, rebalanceRecommendations } = result;

  return `
**🧠 ADVANCED PORTFOLIO OPTIMIZATION RESULTS**

**Risk Profile:** ${
    riskTolerance.charAt(0).toUpperCase() + riskTolerance.slice(1)
  }
**Expected Return:** ${riskMetrics.expectedReturn.toFixed(2)}% annually
**Volatility:** ${riskMetrics.volatility.toFixed(2)}% (${getRiskLevel(
    riskMetrics.volatility
  )})
**Sharpe Ratio:** ${riskMetrics.sharpeRatio.toFixed(2)} (${getSharpeRating(
    riskMetrics.sharpeRatio
  )})

**Monte Carlo Simulation (${monteCarloResults.scenarios.toLocaleString()} scenarios):**
- Success Rate: ${(monteCarloResults.successRate * 100).toFixed(1)}%
- Expected Value (1 year): $${monteCarloResults.expectedFinalValue.toLocaleString()}
- Best Case: $${monteCarloResults.bestCase.toLocaleString()}
- Worst Case: $${monteCarloResults.worstCase.toLocaleString()}

**Risk Management:**
- Maximum Drawdown: ${riskMetrics.maxDrawdown.toFixed(2)}%
- Value at Risk (95%): ${riskMetrics.valueAtRisk.toFixed(2)}%
- Conditional VaR: ${riskMetrics.conditionalVaR.toFixed(2)}%

**Rebalancing:** ${
    rebalanceRecommendations.length
  } recommendations for optimal allocation.
  `.trim();
}

function generateOptimizationInsights(result: any, holdings: any[]): string[] {
  const insights = [];
  const {
    riskMetrics,
    monteCarloResults,
    optimalWeights,
    rebalanceRecommendations,
  } = result;

  // Risk analysis insights
  if (riskMetrics.sharpeRatio > 1.5) {
    insights.push(
      "🎯 Excellent risk-adjusted returns with Sharpe ratio above 1.5"
    );
  } else if (riskMetrics.sharpeRatio < 0.8) {
    insights.push(
      "⚠️ Consider rebalancing to improve risk-adjusted returns (Sharpe ratio below 0.8)"
    );
  }

  // Diversification insights
  const maxWeight = Math.max(...Object.values(optimalWeights));
  if (maxWeight > 0.4) {
    insights.push(
      "🔄 High concentration detected - consider diversifying largest holding"
    );
  } else if (maxWeight < 0.2) {
    insights.push(
      "✅ Well-diversified portfolio with no single position over 20%"
    );
  }

  // Monte Carlo insights
  if (monteCarloResults.successRate > 0.8) {
    insights.push(
      "📈 High probability of positive returns based on Monte Carlo analysis"
    );
  } else if (monteCarloResults.successRate < 0.6) {
    insights.push(
      "⚠️ Lower success probability - consider reducing risk exposure"
    );
  }

  // Expected return insights
  if (riskMetrics.expectedReturn > 15) {
    insights.push("🚀 High growth potential with expected returns above 15%");
  } else if (riskMetrics.expectedReturn < 8) {
    insights.push(
      "💰 Conservative portfolio - consider higher growth allocations"
    );
  }

  // Rebalancing insights
  if (rebalanceRecommendations.length > 0) {
    const totalRebalance = rebalanceRecommendations.reduce(
      (sum, rec) => sum + rec.amount,
      0
    );
    insights.push(
      `🔧 ${
        rebalanceRecommendations.length
      } rebalancing actions recommended (total: $${totalRebalance.toLocaleString()})`
    );
  } else {
    insights.push(
      "✅ Portfolio is already well-optimized - no major rebalancing needed"
    );
  }

  // Volatility insights
  if (riskMetrics.volatility > 25) {
    insights.push(
      "⚡ High volatility portfolio - expect significant price swings"
    );
  } else if (riskMetrics.volatility < 12) {
    insights.push(
      "🛡️ Low volatility portfolio - stable but potentially lower returns"
    );
  }

  return insights;
}

function getRiskLevel(volatility: number): string {
  if (volatility < 10) return "Low Risk";
  if (volatility < 15) return "Moderate Risk";
  if (volatility < 25) return "High Risk";
  return "Very High Risk";
}

function getSharpeRating(sharpe: number): string {
  if (sharpe > 2.0) return "Excellent";
  if (sharpe > 1.5) return "Very Good";
  if (sharpe > 1.0) return "Good";
  if (sharpe > 0.5) return "Fair";
  return "Poor";
}
