# 🚀 AI Portfolio Management Agent

[![Mastra Framework](https://img.shields.io/badge/Built%20with-Mastra-green)](https://mastra.ai)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://hub.docker.com/r/skanda1/nosana-portfolio-agent)
[![Node.js](https://img.shields.io/badge/Node.js-20.9%2B-green)](https://nodejs.org/)

An intelligent AI-powered portfolio management assistant that provides comprehensive investment analysis, real-time market data, and advanced portfolio optimization capabilities through natural language conversations.

![Portfolio Agent Demo](./assets/NosanaBuildersChallengeAgents.jpg)

## 🎯 What This Agent Does

The Portfolio Management Agent is a sophisticated AI assistant designed to help investors make informed decisions about their portfolios. It combines real-time market data, advanced financial analytics, and conversational AI to provide personalized investment insights and recommendations.

## ✨ Core Capabilities

### 📊 **Real-Time Market Analysis**
- **Live Stock Prices**: Fetches current market data for any publicly traded stock
- **Price Change Tracking**: Shows percentage gains/losses and absolute price movements
- **Multi-Stock Queries**: Analyze multiple stocks simultaneously
- **Market Data Integration**: Uses Yahoo Finance for reliable, up-to-date information

### 💼 **Portfolio Performance Analysis**
- **Current Value Calculation**: Automatically calculates your portfolio's current worth
- **Gain/Loss Analysis**: Shows profit/loss for each holding and overall portfolio
- **Cost Basis Tracking**: Remembers your original purchase prices and quantities
- **Performance Metrics**: Provides detailed breakdown of investment performance
- **Diversification Analysis**: Evaluates how well-distributed your investments are

### 📈 **Benchmark Comparison**
- **S&P 500 Comparison**: Compare your portfolio performance against the market
- **Multiple Index Tracking**: Benchmark against NASDAQ, DOW, and other major indices
- **Relative Performance**: See if you're outperforming or underperforming the market
- **Historical Analysis**: Track performance over different time periods
- **Risk-Adjusted Returns**: Evaluate performance considering risk factors

### 🎯 **Advanced Portfolio Optimization**
- **Monte Carlo Simulation**: Run thousands of scenarios to predict portfolio outcomes
- **Efficient Frontier Analysis**: Find optimal risk-return combinations
- **Rebalancing Recommendations**: Suggests adjustments to improve portfolio performance
- **Risk Assessment**: Analyze volatility and potential downside risk
- **Expected Return Calculations**: Project future portfolio performance

### 🧠 **Natural Language Interface**
- **Conversational Input**: Describe your portfolio in plain English
- **Automatic Parsing**: Converts natural language to structured data
- **Context Awareness**: Remembers previous conversations and preferences
- **Smart Symbol Recognition**: Converts company names to stock symbols automatically
- **Flexible Input Formats**: Accepts various ways of describing investments

### 💾 **Persistent Memory System**
- **User Preferences**: Remembers your risk tolerance and investment goals
- **Portfolio History**: Tracks changes to your holdings over time
- **Conversation Context**: Maintains context across multiple sessions
- **Personalized Recommendations**: Tailors advice based on your specific situation

## 🏗️ Technical Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Input    │    │  Portfolio      │    │  Yahoo Finance  │
│  (Natural Lang) │◄──►│  Agent          │◄──►│  Market Data    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Qwen 2.5      │    │  LibSQL         │    │  Real-time      │
│   LLM Model     │    │  Memory Store   │    │  Price Data     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Core Components:**
- **Mastra AI Framework**: Handles agent orchestration and tool calling
- **Qwen 2.5 LLM**: Provides natural language understanding and generation
- **LibSQL Database**: Stores user preferences and conversation history
- **Yahoo Finance API**: Sources real-time market data
- **Monte Carlo Engine**: Performs complex financial simulations

## 💡 Detailed Usage Examples

### Portfolio Analysis Workflow
```
User: "I own 100 Apple shares bought at $150 each, 50 Microsoft shares at $300 each, and 25 Google shares at $120 each"

Agent Response:
📊 Portfolio Analysis Complete!

Current Holdings:
• AAPL: 100 shares @ $191.45 each = $19,145 (was $15,000, +$4,145 or +27.6%)
• MSFT: 50 shares @ $378.20 each = $18,910 (was $15,000, +$3,910 or +26.1%)  
• GOOGL: 25 shares @ $138.75 each = $3,469 (was $3,000, +$469 or +15.6%)

Portfolio Summary:
💰 Total Value: $41,524
📈 Total Gain: $8,524 (+25.8%)
💵 Original Investment: $33,000

Top Performer: Apple (+27.6%)
Diversification: Good across tech sector
```

### Real-Time Price Queries
```
User: "What are the current prices for Apple, Tesla, and Amazon?"

Agent Response:
📈 Real-Time Stock Prices:

🍎 AAPL (Apple Inc.)
• Current: $191.45
• Change: +$3.20 (+1.70%)
• Day Range: $188.10 - $192.50

🚗 TSLA (Tesla Inc.)
• Current: $248.20
• Change: -$3.15 (-1.25%)
• Day Range: $245.80 - $251.40

📦 AMZN (Amazon.com Inc.)
• Current: $178.90
• Change: +$2.45 (+1.39%)
• Day Range: $176.20 - $179.50

Last Updated: 2025-01-14 14:30:25 EST
```

### Benchmark Comparison Analysis
```
User: "How is my portfolio performing compared to the S&P 500?"

Agent Response:
📊 Benchmark Performance Comparison

Your Portfolio vs Market:
📈 Your Portfolio: +25.8% (YTD)
📊 S&P 500 (SPY): +18.2% (YTD)
🎯 Outperformance: +7.6%

Performance Breakdown:
• Tech Sector Allocation: 100% (vs 28% in S&P 500)
• Risk Level: Higher (concentrated in tech)
• Correlation with Market: 0.85 (high)

Recommendation: Consider diversification into other sectors to reduce risk while maintaining strong returns.
```

### Portfolio Optimization Results
```
User: "Optimize my portfolio using Monte Carlo simulation"

Agent Response:
🎯 Monte Carlo Portfolio Optimization Results
(Based on 10,000 simulations)

Current Allocation:
• AAPL: 46.1% ($19,145)
• MSFT: 45.5% ($18,910)
• GOOGL: 8.4% ($3,469)

Optimized Allocation (for current risk level):
• AAPL: 35% (-11.1%)
• MSFT: 40% (-5.5%)
• GOOGL: 25% (+16.6%)

Expected Outcomes (1 Year):
📈 Expected Return: 12.8% (vs 11.2% current)
📊 Volatility: 22.1% (vs 24.3% current)
🎯 Sharpe Ratio: 0.58 (vs 0.46 current)

Recommendation: Increase Google allocation and reduce Apple concentration for better risk-adjusted returns.
```

## 🛠️ Technology Stack

### **AI & Language Processing**
- **Framework**: Mastra AI Framework for agent orchestration
- **LLM**: Qwen 2.5:1.5b for natural language understanding
- **Memory**: LibSQL for persistent conversation storage
- **NLP**: Advanced natural language parsing for portfolio inputs

### **Financial Data & Analysis**
- **Market Data**: Yahoo Finance API integration
- **Optimization**: Custom Monte Carlo simulation engine
- **Analytics**: Statistical analysis and performance metrics
- **Benchmarking**: Real-time index comparison capabilities

### **Infrastructure**
- **Runtime**: Node.js 20.9+ with TypeScript
- **Container**: Docker with Ollama base image
- **Database**: LibSQL for memory persistence
- **API**: RESTful endpoints for external integrations

## 🚀 Getting Started

### Prerequisites
- Node.js 20.9.0 or higher
- pnpm (recommended) or npm
- Docker (optional, for containerization)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/skanda-gowda-10/Portfolio-Management-Agent.git
cd Portfolio-Management-Agent
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your settings
```

4. **Start the agent**
```bash
pnpm run dev
```

5. **Access the interface**
Open your browser to `http://localhost:4111`

## 📖 Usage Guide

### Basic Portfolio Input
Simply describe your holdings in natural language:
- "I have 100 shares of Apple at $150 each"
- "My portfolio includes 50 Microsoft stocks bought at $300"
- "I own AAPL, MSFT, and GOOGL stocks"

### Analysis Commands
- **Current Prices**: "What's Apple's current price?"
- **Portfolio Analysis**: "Analyze my portfolio performance"
- **Benchmark Comparison**: "Compare my portfolio to the S&P 500"
- **Optimization**: "Optimize my portfolio allocation"

### Advanced Features
- **Risk Assessment**: "What's my portfolio's risk level?"
- **Diversification Analysis**: "How well diversified am I?"
- **Rebalancing**: "Should I rebalance my portfolio?"
- **Future Projections**: "What are my expected returns?"

## 🔧 Configuration

### Environment Variables
```bash
# LLM Configuration
MODEL_NAME_AT_ENDPOINT=qwen2.5:1.5b
API_BASE_URL=http://127.0.0.1:11434/api

# Database
DATABASE_URL=file:./memory.db

# Optional: Development settings
DEV_PORT=4111
DEBUG=true
```

## 📊 Features in Detail

### **Natural Language Processing**
The agent understands various ways of describing investments:
- Company names → Stock symbols (Apple → AAPL)
- Different quantity formats (100 shares, 100 stocks)
- Price formats ($150, $150.00, 150 dollars)
- Mixed input styles in single conversations

### **Memory & Context**
- Remembers your portfolio across sessions
- Tracks conversation history
- Learns your preferences and risk tolerance
- Provides personalized recommendations

### **Real-Time Data Integration**
- Live market data from Yahoo Finance
- Automatic price updates
- After-hours trading information
- Historical price data for analysis

### **Advanced Analytics**
- Monte Carlo simulations with 10,000+ iterations
- Efficient frontier calculations
- Risk-return optimization
- Portfolio correlation analysis
- Sharpe ratio and other performance metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-analysis-tool`)
3. Commit your changes (`git commit -m 'Add new analysis feature'`)
4. Push to the branch (`git push origin feature/new-analysis-tool`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/skanda-gowda-10/Portfolio-Management-Agent/issues)
- **Documentation**: [Mastra Docs](https://mastra.ai/docs)

---

**Built for intelligent investment management through conversational AI**
