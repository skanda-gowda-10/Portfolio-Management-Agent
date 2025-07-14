# 🚀 AI Portfolio Management Agent

[![Nosana Challenge](https://img.shields.io/badge/Nosana-Builders%20Challenge-blue)](https://discord.gg/nosana-ai)
[![Mastra Framework](https://img.shields.io/badge/Built%20with-Mastra-green)](https://mastra.ai)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://hub.docker.com/r/skanda1/nosana-portfolio-agent)

An advanced AI-powered portfolio management assistant built for the **Nosana Builders Challenge**. This agent provides real-time market analysis, portfolio optimization, and intelligent investment insights using natural language processing.

![Portfolio Agent Demo](./assets/NosanaBuildersChallengeAgents.jpg)

## 🎯 Challenge Entry

**Challenge Level**: Advanced  
**Category**: AI Agent with Real-World Utility  
**Deployment**: Nosana Decentralized GPU Network  
**Docker Hub**: [`skanda1/nosana-portfolio-agent`](https://hub.docker.com/r/skanda1/nosana-portfolio-agent)

## ✨ Features

### 🔴 **Real-Time Market Data**

- Live stock price tracking via Yahoo Finance integration
- Support for major stocks (AAPL, MSFT, GOOGL, TSLA, etc.)
- Real-time market data retrieval with error handling

### 📊 **Advanced Portfolio Analysis**

- Comprehensive portfolio performance metrics
- Current value vs. cost basis analysis
- Gain/loss calculations with percentage returns
- Diversification analysis across holdings

### 📈 **Benchmark Comparison**

- Performance comparison against S&P 500
- Major market indices comparison (NASDAQ, DOW)
- Historical performance analysis
- Risk-adjusted return metrics

### 🎯 **Portfolio Optimization**

- Monte Carlo simulation for risk analysis
- Efficient frontier calculation
- Risk-return optimization
- Rebalancing recommendations

### 🧠 **Natural Language Interface**

- Conversational portfolio management
- Automatic parsing of natural language inputs
- Context-aware responses
- Memory system for personalized recommendations

### 💾 **Persistent Memory**

- LibSQL database for user preferences
- Historical conversation tracking
- Personalized investment insights
- Long-term goal tracking

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mastra Core   │    │  Portfolio      │    │  Yahoo Finance  │
│   Framework     │◄──►│  Agent          │◄──►│  API            │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Qwen 2.5      │    │  LibSQL         │    │  Real-time      │
│   LLM Model     │    │  Memory Store   │    │  Price Data     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20.9.0 or higher
- pnpm (recommended) or npm
- Docker (for containerization)

### Local Development

1. **Clone the repository**

```bash
git clone https://github.com/skanda-gowda-10/Portfolio-Management-Agent.git
cd Portfolio-Management-Agent
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up environment variables**

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
MODEL_NAME_AT_ENDPOINT=qwen2.5:1.5b
API_BASE_URL=http://127.0.0.1:11434/api
```

4. **Start development server**

```bash
pnpm run dev
```

5. **Access the agent**
   Open your browser and navigate to `http://localhost:4111`

### Docker Deployment

1. **Build the container**

```bash
docker build -t skanda1/nosana-portfolio-agent:latest .
```

2. **Run locally**

```bash
docker run -p 8080:8080 skanda1/nosana-portfolio-agent:latest
```

3. **Access at** `http://localhost:8080`

## 💡 Usage Examples

### Portfolio Analysis

```
User: "I own 100 Apple shares at $150 each and 50 Microsoft shares at $300 each"
Agent: Automatically analyzes your portfolio, showing current values, gains/losses, and diversification metrics
```

### Real-time Prices

```
User: "What's the current price of Apple and Tesla?"
Agent: Fetches live prices: AAPL: $191.45 (+2.1%), TSLA: $248.20 (-1.3%)
```

### Benchmark Comparison

```
User: "How does my portfolio compare to the S&P 500?"
Agent: Your portfolio: +15.2% vs S&P 500: +12.8% (outperforming by 2.4%)
```

### Portfolio Optimization

```
User: "Optimize my portfolio using Monte Carlo simulation"
Agent: Runs 10,000 simulations, suggests optimal allocation for your risk tolerance
```

## 🛠️ Technology Stack

- **Framework**: [Mastra AI Framework](https://mastra.ai)
- **LLM**: Qwen 2.5:1.5b (via Ollama)
- **Memory**: LibSQL Database
- **APIs**: Yahoo Finance (via unofficial API)
- **Container**: Docker with Ollama base image
- **Deployment**: Nosana Decentralized GPU Network

## 📁 Project Structure

```
src/
├── mastra/
│   ├── agents/
│   │   └── portfolio-agent/
│   │       ├── agent.ts              # Main agent configuration
│   │       ├── tools/
│   │       │   ├── portfolio-analyzer.ts    # Portfolio analysis tool
│   │       │   ├── real-time-prices.ts      # Price fetching tool
│   │       │   ├── portfolio-optimizer.ts   # Optimization tool
│   │       │   └── benchmark-comparison.ts  # Benchmark tool
│   │       └── types/
│   │           └── portfolio-types.ts       # TypeScript types
│   ├── config.ts                    # Mastra configuration
│   └── index.ts                     # Main entry point
├── nos_job_def/
│   └── nosana_mastra.json          # Nosana deployment config
├── Dockerfile                       # Container configuration
└── package.json                     # Dependencies and scripts
```

## 🎬 Demo Video

[**Watch the Portfolio Agent in Action**](YOUR_VIDEO_LINK_HERE)

Features demonstrated:

- Natural language portfolio input
- Real-time price fetching
- Portfolio analysis and metrics
- Benchmark comparison
- Monte Carlo optimization
- Cross-device access capability

## 🚀 Nosana Deployment

### Automated Deployment

Run the deployment script:

```bash
./deploy.bat
```

### Manual Deployment

1. Update Docker image in `nos_job_def/nosana_mastra.json`
2. Push to Docker Hub: `docker push skanda1/nosana-portfolio-agent:latest`
3. Deploy via [Nosana Dashboard](https://dashboard.nosana.com/deploy)

### Live Demo

**Deployed URL**: [Your Nosana deployment URL here]

## 🏆 Challenge Submission

This project demonstrates:

- ✅ **Innovation**: Advanced portfolio management with AI
- ✅ **Technical Implementation**: Mastra framework, real-time APIs, optimization algorithms
- ✅ **Nosana Integration**: Successfully deployed on decentralized GPU network
- ✅ **Real-World Impact**: Practical financial analysis and investment optimization

### Challenge Requirements Met

- [x] Fork from nosana-ai/agent-challenge
- [x] Custom AI agent with tool-calling capabilities
- [x] Docker container published to Docker Hub
- [x] Successful deployment on Nosana network
- [x] Comprehensive documentation
- [x] Demo video showcasing functionality
- [x] Social media post with required tags

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Nosana](https://nosana.io) for the Builders Challenge
- [Mastra](https://mastra.ai) for the excellent AI framework
- [Ollama](https://ollama.ai) for local LLM support
- Yahoo Finance for market data

## 📞 Support

- **Discord**: [Nosana Community](https://discord.gg/nosana-ai)
- **Documentation**: [Mastra Docs](https://mastra.ai/docs)
- **Issues**: [GitHub Issues](https://github.com/skanda-gowda-10/Portfolio-Management-Agent/issues)

---

**Built with ❤️ for the Nosana Builders Challenge**

_Showcasing the power of AI agents on decentralized infrastructure_
