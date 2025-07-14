export interface Portfolio {
  id: string;
  name: string;
  holdings: Holding[];
  totalValue: number;
  cashBalance: number;
  lastUpdated: Date;
  riskProfile: RiskProfile;
  performance: PerformanceMetrics;
}

export interface Holding {
  symbol: string;
  name: string;
  quantity: number;
  averageCost: number;
  currentPrice: number;
  marketValue: number;
  gainLoss: number;
  gainLossPercent: number;
  sector: string;
  assetType: AssetType;
  lastUpdated: Date;
}

export interface Transaction {
  id: string;
  portfolioId: string;
  symbol: string;
  type: TransactionType;
  quantity: number;
  price: number;
  totalAmount: number;
  fees: number;
  date: Date;
  notes?: string;
}

export interface PerformanceMetrics {
  totalReturn: number;
  totalReturnPercent: number;
  dayChange: number;
  dayChangePercent: number;
  weekChange: number;
  monthChange: number;
  yearChange: number;
  annualizedReturn: number;
  sharpeRatio: number;
  volatility: number;
  maxDrawdown: number;
}

export interface RiskProfile {
  riskScore: number; // 1-10 scale
  riskTolerance: RiskTolerance;
  diversificationScore: number;
  concentrationRisk: number;
  sectorExposure: SectorExposure[];
  assetAllocation: AssetAllocation[];
}

export interface SectorExposure {
  sector: string;
  percentage: number;
  value: number;
  riskLevel: RiskLevel;
}

export interface AssetAllocation {
  assetType: AssetType;
  percentage: number;
  value: number;
  targetPercentage?: number;
}

export interface PortfolioAnalysis {
  portfolioId: string;
  analysisDate: Date;
  overallHealth: HealthScore;
  riskAssessment: RiskAssessment;
  diversificationAnalysis: DiversificationAnalysis;
  recommendations: Recommendation[];
  alerts: Alert[];
}

export interface Recommendation {
  id: string;
  type: RecommendationType;
  priority: Priority;
  title: string;
  description: string;
  action: string;
  reasoning: string;
  potentialImpact: string;
  confidence: number; // 0-1 scale
}

export interface Alert {
  id: string;
  type: AlertType;
  severity: Severity;
  message: string;
  symbol?: string;
  threshold?: number;
  currentValue?: number;
  timestamp: Date;
}

export interface DiversificationAnalysis {
  overallScore: number; // 1-10 scale
  sectorDiversification: number;
  geographicDiversification: number;
  assetClassDiversification: number;
  correlationAnalysis: CorrelationData[];
  recommendations: string[];
}

export interface CorrelationData {
  symbol1: string;
  symbol2: string;
  correlation: number;
  riskLevel: RiskLevel;
}

export interface RiskAssessment {
  overallRisk: RiskLevel;
  volatilityRisk: number;
  concentrationRisk: number;
  liquidityRisk: number;
  marketRisk: number;
  creditRisk: number;
  currencyRisk: number;
}

export interface HealthScore {
  overall: number; // 1-10 scale
  diversification: number;
  performance: number;
  riskManagement: number;
  costs: number;
  allocation: number;
}

// Enums
export enum AssetType {
  STOCK = "stock",
  BOND = "bond",
  ETF = "etf",
  MUTUAL_FUND = "mutual_fund",
  CRYPTO = "crypto",
  COMMODITY = "commodity",
  REAL_ESTATE = "real_estate",
  CASH = "cash",
  OTHER = "other",
}

export enum TransactionType {
  BUY = "buy",
  SELL = "sell",
  DIVIDEND = "dividend",
  SPLIT = "split",
  DEPOSIT = "deposit",
  WITHDRAWAL = "withdrawal",
}

export enum RiskTolerance {
  CONSERVATIVE = "conservative",
  MODERATE = "moderate",
  AGGRESSIVE = "aggressive",
  VERY_AGGRESSIVE = "very_aggressive",
}

export enum RiskLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  VERY_HIGH = "very_high",
}

export enum RecommendationType {
  BUY = "buy",
  SELL = "sell",
  REBALANCE = "rebalance",
  DIVERSIFY = "diversify",
  REDUCE_RISK = "reduce_risk",
  COST_OPTIMIZATION = "cost_optimization",
  TAX_OPTIMIZATION = "tax_optimization",
}

export enum AlertType {
  PRICE_TARGET = "price_target",
  STOP_LOSS = "stop_loss",
  VOLATILITY = "volatility",
  CONCENTRATION = "concentration",
  PERFORMANCE = "performance",
  REBALANCING = "rebalancing",
  NEWS = "news",
}

export enum Priority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

export enum Severity {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  CRITICAL = "critical",
}

// Input schemas for tools
export interface PortfolioInput {
  holdings?: HoldingInput[];
  cashBalance?: number;
  riskTolerance?: RiskTolerance;
}

export interface HoldingInput {
  symbol: string;
  quantity: number;
  averageCost: number;
}

export interface AnalysisRequest {
  portfolioData: PortfolioInput;
  analysisType?: AnalysisType[];
  includeRecommendations?: boolean;
  riskLevel?: RiskLevel;
}

export enum AnalysisType {
  PERFORMANCE = "performance",
  RISK = "risk",
  DIVERSIFICATION = "diversification",
  ALLOCATION = "allocation",
  ALL = "all",
}
