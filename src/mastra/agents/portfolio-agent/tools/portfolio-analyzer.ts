import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { marketDataService, StockQuote } from "../services/market-data";

export const portfolioAnalyzer = createTool({
  id: "analyze-portfolio",
  description:
    "Perform comprehensive real-time portfolio analysis with live market data",
  inputSchema: z.object({
    holdings: z
      .array(
        z.object({
          symbol: z.string().describe("Stock symbol (e.g., AAPL)"),
          quantity: z.number().describe("Number of shares owned"),
          averageCost: z.number().describe("Average cost per share"),
        })
      )
      .describe("Portfolio holdings"),
    cashBalance: z.number().optional().describe("Cash balance in portfolio"),
    riskTolerance: z
      .enum(["conservative", "moderate", "aggressive", "very_aggressive"])
      .optional(),
  }),
  outputSchema: z.object({
    portfolioValue: z.object({
      totalValue: z.number(),
      totalCost: z.number(),
      totalReturn: z.number(),
      totalReturnPercent: z.number(),
      cashBalance: z.number(),
      investedValue: z.number(),
      lastUpdated: z.string(),
    }),
    holdings: z.array(
      z.object({
        symbol: z.string(),
        quantity: z.number(),
        averageCost: z.number(),
        currentPrice: z.number(),
        marketValue: z.number(),
        totalCost: z.number(),
        gainLoss: z.number(),
        gainLossPercent: z.number(),
        dayChange: z.number(),
        dayChangePercent: z.number(),
        weight: z.number(),
        marketCap: z.string(),
      })
    ),
    riskAssessment: z.object({
      overallRisk: z.string(),
      riskScore: z.number(),
      concentrationRisk: z.number(),
      volatilityEstimate: z.number(),
      diversificationScore: z.number(),
      alerts: z.array(z.string()),
    }),
    recommendations: z.array(
      z.object({
        type: z.string(),
        priority: z.string(),
        title: z.string(),
        description: z.string(),
        action: z.string(),
        reasoning: z.string(),
      })
    ),
    marketAnalysis: z.object({
      topPerformers: z.array(
        z.object({
          symbol: z.string(),
          gainLossPercent: z.number(),
          marketValue: z.number(),
        })
      ),
      underperformers: z.array(
        z.object({
          symbol: z.string(),
          gainLossPercent: z.number(),
          marketValue: z.number(),
        })
      ),
      sectorExposure: z.array(
        z.object({
          sector: z.string(),
          percentage: z.number(),
          value: z.number(),
        })
      ),
    }),
    summary: z.string(),
  }),
  execute: async ({ context }) => {
    // Handle undefined or malformed context
    if (!context) {
      throw new Error(
        "No portfolio data provided. Please specify your holdings with symbols, quantities, and average costs."
      );
    }

    // If context is a string (natural language), return helpful message
    if (typeof context === "string") {
      throw new Error(
        "I need specific portfolio data to analyze. Please provide: stock symbols, quantities, and average purchase prices. For example: 'AAPL: 100 shares at $150, MSFT: 50 shares at $300'"
      );
    }

    return await analyzePortfolioWithRealTimeData(context);
  },
});

const analyzePortfolioWithRealTimeData = async (request: any) => {
  // Ensure request is an object
  if (!request || typeof request !== "object") {
    throw new Error(
      "Invalid portfolio data format. Please provide holdings as an object with symbols, quantities, and average costs."
    );
  }

  const {
    holdings = [],
    cashBalance = 0,
    riskTolerance = "moderate",
  } = request;

  try {
    // Validate holdings array
    if (!Array.isArray(holdings)) {
      throw new Error(
        "Holdings must be provided as an array of stock positions."
      );
    }

    // Validate each holding
    const validatedHoldings = holdings.filter((holding) => {
      if (!holding || typeof holding !== "object") return false;
      if (!holding.symbol || typeof holding.symbol !== "string") return false;
      if (typeof holding.quantity !== "number" || holding.quantity <= 0)
        return false;
      if (typeof holding.averageCost !== "number" || holding.averageCost <= 0)
        return false;
      return true;
    });

    if (validatedHoldings.length === 0) {
      throw new Error(
        "No valid holdings found. Each holding needs: symbol (string), quantity (number), and averageCost (number)."
      );
    }

    // Extract all unique symbols
    const symbols = [
      ...new Set(validatedHoldings.map((h: any) => h.symbol.toUpperCase())),
    ];

    if (symbols.length === 0) {
      throw new Error("No valid stock symbols found in holdings.");
    }

    // Fetch real-time market data for all holdings
    console.log(`Fetching real-time market data for: [${symbols.join(", ")}]`);
    const marketData = await marketDataService.getMultipleStockPrices(symbols);

    // Calculate portfolio metrics with real-time data
    let totalValue = typeof cashBalance === "number" ? cashBalance : 0;
    let totalCost = 0; // Start at 0, will add cost basis for each holding
    const processedHoldings: any[] = [];
    const sectorMap = new Map<string, number>();

    // Process each holding with real-time prices
    for (const holding of validatedHoldings) {
      const symbol = holding.symbol.toUpperCase();
      const quote = marketData.get(symbol);

      if (!quote) {
        console.warn(`No market data available for ${symbol}, skipping...`);
        continue;
      }

      const currentPrice = quote.price;
      const marketValue = holding.quantity * currentPrice;
      const costBasis = holding.quantity * holding.averageCost;
      const gainLoss = marketValue - costBasis;
      const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;

      // Calculate day change
      const dayChange = holding.quantity * quote.change;
      const dayChangePercent = quote.changePercent;

      const processedHolding = {
        symbol,
        quantity: holding.quantity,
        averageCost: holding.averageCost,
        currentPrice: Math.round(currentPrice * 100) / 100,
        marketValue: Math.round(marketValue * 100) / 100,
        totalCost: Math.round(costBasis * 100) / 100,
        gainLoss: Math.round(gainLoss * 100) / 100,
        gainLossPercent: Math.round(gainLossPercent * 100) / 100,
        dayChange: Math.round(dayChange * 100) / 100,
        dayChangePercent: Math.round(dayChangePercent * 100) / 100,
        weight: 0, // Will calculate after total
        marketCap: quote.marketCap || "N/A",
        sector: getSectorForSymbol(symbol),
      };

      processedHoldings.push(processedHolding);
      totalValue += marketValue;
      totalCost += costBasis;

      // Track sector exposure
      const sector = processedHolding.sector;
      sectorMap.set(sector, (sectorMap.get(sector) || 0) + marketValue);
    }

    if (processedHoldings.length === 0) {
      throw new Error(
        "No holdings could be processed. Please check that all stock symbols are valid."
      );
    }

    // Calculate weights (percentages)
    const investedValue =
      totalValue - (typeof cashBalance === "number" ? cashBalance : 0);
    processedHoldings.forEach((holding) => {
      holding.weight =
        investedValue > 0
          ? Math.round((holding.marketValue / investedValue) * 10000) / 100
          : 0;
    });

    // Portfolio performance calculations
    const totalReturn = totalValue - totalCost;
    const totalReturnPercent =
      totalCost > 0 ? (totalReturn / totalCost) * 100 : 0;

    // Risk assessment
    const riskAssessment = calculateRiskAssessment(
      processedHoldings,
      totalValue,
      riskTolerance
    );

    // Generate recommendations
    const recommendations = generateIntelligentRecommendations(
      processedHoldings,
      riskAssessment,
      riskTolerance
    );

    // Market analysis
    const marketAnalysis = generateMarketAnalysis(
      processedHoldings,
      sectorMap,
      investedValue
    );

    // Portfolio summary
    const summary = generateDetailedSummary(
      totalValue,
      totalReturnPercent,
      processedHoldings.length,
      riskAssessment
    );

    return {
      portfolioValue: {
        totalValue: Math.round(totalValue * 100) / 100,
        totalCost: Math.round(totalCost * 100) / 100,
        totalReturn: Math.round(totalReturn * 100) / 100,
        totalReturnPercent: Math.round(totalReturnPercent * 100) / 100,
        cashBalance:
          Math.round(
            (typeof cashBalance === "number" ? cashBalance : 0) * 100
          ) / 100,
        investedValue: Math.round(investedValue * 100) / 100,
        lastUpdated: new Date().toISOString(),
      },
      holdings: processedHoldings.map((h) => ({
        symbol: h.symbol,
        quantity: h.quantity,
        averageCost: h.averageCost,
        currentPrice: h.currentPrice,
        marketValue: h.marketValue,
        totalCost: h.totalCost,
        gainLoss: h.gainLoss,
        gainLossPercent: h.gainLossPercent,
        dayChange: h.dayChange,
        dayChangePercent: h.dayChangePercent,
        weight: h.weight,
        marketCap: h.marketCap,
      })),
      riskAssessment,
      recommendations,
      marketAnalysis,
      summary,
    };
  } catch (error) {
    console.error("Portfolio analysis error:", error);
    throw new Error(`Portfolio analysis failed: ${error.message || error}`);
  }
};

const calculateRiskAssessment = (
  holdings: any[],
  totalValue: number,
  riskTolerance: string
) => {
  if (holdings.length === 0) {
    return {
      overallRisk: "unknown",
      riskScore: 5,
      concentrationRisk: 0,
      volatilityEstimate: 0,
      diversificationScore: 0,
      alerts: ["No holdings to analyze"],
    };
  }

  // Calculate concentration risk (largest holding percentage)
  const concentrationRisk = Math.max(...holdings.map((h) => h.weight));

  // Estimate volatility based on price movements and concentration
  const avgDayChange =
    holdings.reduce((sum, h) => sum + Math.abs(h.dayChangePercent), 0) /
    holdings.length;
  const volatilityEstimate = avgDayChange * (1 + concentrationRisk / 100);

  // Calculate diversification score
  const numHoldings = holdings.length;
  const sectors = [...new Set(holdings.map((h) => h.sector))];
  const diversificationScore = Math.min(
    10,
    numHoldings * 0.5 + sectors.length * 1.5
  );

  // Risk scoring
  let riskScore = 5; // Base score
  if (concentrationRisk > 30) riskScore += 2;
  if (concentrationRisk > 50) riskScore += 1;
  if (volatilityEstimate > 5) riskScore += 1;
  if (diversificationScore < 5) riskScore += 1;
  if (numHoldings < 5) riskScore += 1;
  riskScore = Math.min(10, Math.max(1, riskScore));

  const overallRisk =
    riskScore <= 3
      ? "low"
      : riskScore <= 6
      ? "medium"
      : riskScore <= 8
      ? "high"
      : "very_high";

  // Generate alerts
  const alerts: string[] = [];
  if (concentrationRisk > 40) {
    alerts.push(
      `High concentration risk: ${concentrationRisk.toFixed(
        1
      )}% in single holding`
    );
  }
  if (volatilityEstimate > 8) {
    alerts.push(
      `High volatility detected: ${volatilityEstimate.toFixed(
        1
      )}% estimated daily movement`
    );
  }
  if (diversificationScore < 4) {
    alerts.push(
      "Poor diversification: consider adding more holdings or sectors"
    );
  }

  return {
    overallRisk,
    riskScore: Math.round(riskScore * 10) / 10,
    concentrationRisk: Math.round(concentrationRisk * 100) / 100,
    volatilityEstimate: Math.round(volatilityEstimate * 100) / 100,
    diversificationScore: Math.round(diversificationScore * 100) / 100,
    alerts,
  };
};

const generateIntelligentRecommendations = (
  holdings: any[],
  riskAssessment: any,
  riskTolerance: string
) => {
  const recommendations: any[] = [];

  // High concentration risk
  if (riskAssessment.concentrationRisk > 30) {
    recommendations.push({
      type: "rebalance",
      priority: "high",
      title: "Reduce Concentration Risk",
      description: `Your largest holding represents ${riskAssessment.concentrationRisk.toFixed(
        1
      )}% of your portfolio`,
      action:
        "Consider trimming your largest position and diversifying into other holdings",
      reasoning:
        "High concentration increases portfolio risk and reduces diversification benefits",
    });
  }

  // Poor diversification
  if (riskAssessment.diversificationScore < 5) {
    recommendations.push({
      type: "diversify",
      priority: "high",
      title: "Improve Portfolio Diversification",
      description: `Your diversification score is ${riskAssessment.diversificationScore.toFixed(
        1
      )}/10`,
      action:
        "Add holdings from different sectors or consider broad market ETFs",
      reasoning:
        "Better diversification reduces overall portfolio risk and volatility",
    });
  }

  // Risk tolerance mismatch
  if (riskTolerance === "conservative" && riskAssessment.riskScore > 6) {
    recommendations.push({
      type: "reduce_risk",
      priority: "medium",
      title: "Portfolio Risk Exceeds Tolerance",
      description: `Your portfolio risk (${riskAssessment.riskScore}/10) is higher than conservative preference`,
      action:
        "Consider adding bonds, dividend stocks, or reducing volatile positions",
      reasoning:
        "Aligning portfolio risk with your tolerance helps ensure comfortable investing",
    });
  }

  // Performance-based recommendations
  const underperformers = holdings.filter((h) => h.gainLossPercent < -10);
  if (underperformers.length > 0) {
    recommendations.push({
      type: "review",
      priority: "medium",
      title: "Review Underperforming Holdings",
      description: `${underperformers.length} holdings showing significant losses (>10%)`,
      action:
        "Research fundamentals and consider if these positions still align with your thesis",
      reasoning:
        "Regular review of underperformers helps identify potential issues early",
    });
  }

  return recommendations.slice(0, 5); // Limit to top 5 recommendations
};

const generateMarketAnalysis = (
  holdings: any[],
  sectorMap: Map<string, number>,
  investedValue: number
) => {
  // Top performers and underperformers
  const topPerformers = holdings
    .filter((h) => h.gainLossPercent > 0)
    .sort((a, b) => b.gainLossPercent - a.gainLossPercent)
    .slice(0, 3)
    .map((h) => ({
      symbol: h.symbol,
      gainLossPercent: h.gainLossPercent,
      marketValue: h.marketValue,
    }));

  const underperformers = holdings
    .filter((h) => h.gainLossPercent < 0)
    .sort((a, b) => a.gainLossPercent - b.gainLossPercent)
    .slice(0, 3)
    .map((h) => ({
      symbol: h.symbol,
      gainLossPercent: h.gainLossPercent,
      marketValue: h.marketValue,
    }));

  // Sector exposure
  const sectorExposure = Array.from(sectorMap.entries())
    .map(([sector, value]) => ({
      sector,
      percentage: Math.round((value / investedValue) * 10000) / 100,
      value: Math.round(value * 100) / 100,
    }))
    .sort((a, b) => b.percentage - a.percentage);

  return {
    topPerformers,
    underperformers,
    sectorExposure,
  };
};

const generateDetailedSummary = (
  totalValue: number,
  totalReturnPercent: number,
  numHoldings: number,
  riskAssessment: any
) => {
  const performanceDesc =
    totalReturnPercent >= 15
      ? "excellent"
      : totalReturnPercent >= 8
      ? "strong"
      : totalReturnPercent >= 0
      ? "positive"
      : totalReturnPercent >= -5
      ? "modest decline"
      : "significant decline";

  return (
    `Your portfolio is currently valued at $${totalValue.toLocaleString()} with ${performanceDesc} performance of ${totalReturnPercent.toFixed(
      1
    )}%. ` +
    `You have ${numHoldings} holdings with a risk level of ${
      riskAssessment.overallRisk
    } and diversification score of ${riskAssessment.diversificationScore.toFixed(
      1
    )}/10. ` +
    `${
      riskAssessment.alerts.length > 0
        ? "Key areas for attention: " + riskAssessment.alerts.join("; ") + "."
        : "Your portfolio structure looks reasonable."
    }`
  );
};

// Sector mapping for popular stocks
const getSectorForSymbol = (symbol: string): string => {
  const sectorMap: { [key: string]: string } = {
    AAPL: "Technology",
    MSFT: "Technology",
    GOOGL: "Technology",
    GOOG: "Technology",
    AMZN: "Consumer Discretionary",
    TSLA: "Consumer Discretionary",
    NVDA: "Technology",
    META: "Technology",
    "BRK.B": "Financial Services",
    JNJ: "Healthcare",
    V: "Financial Services",
    WMT: "Consumer Staples",
    PG: "Consumer Staples",
    UNH: "Healthcare",
    HD: "Consumer Discretionary",
    MA: "Financial Services",
    PFE: "Healthcare",
    KO: "Consumer Staples",
    DIS: "Communication Services",
    NFLX: "Communication Services",
    SPY: "ETF - Broad Market",
    QQQ: "ETF - Technology",
    VTI: "ETF - Total Market",
  };

  return sectorMap[symbol] || "Unknown";
};
 