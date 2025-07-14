# Portfolio Management Agent - Deployment Guide

## 🎯 Project Overview

This is an advanced AI portfolio management agent built for the **Nosana Builders Challenge**. The agent provides:

- **Real-time stock price tracking** with Yahoo Finance integration
- **Portfolio analysis** with comprehensive performance metrics
- **Benchmark comparison** against S&P 500 and major indices
- **Portfolio optimization** using Monte Carlo simulation
- **Natural language processing** for easy user interaction
- **Memory system** for personalized recommendations

## 🏗️ Architecture

- **Framework**: Mastra AI Framework
- **LLM**: Qwen 2.5:1.5b (via Ollama)
- **Memory**: LibSQL database
- **Container**: Docker with Ollama base image
- **Deployment**: Nosana decentralized GPU network

## 🚀 Deployment Steps

### 1. Prerequisites

- Docker Desktop installed and running
- Docker Hub account created
- Nosana CLI installed (optional) or access to Nosana Dashboard

### 2. Build and Test Locally

```bash
# Install dependencies
pnpm install

# Build the project
pnpm run build

# Build Docker container (using skanda1 as Docker Hub username)
docker build -t skanda1/nosana-portfolio-agent:latest .

# Test locally
docker run -d -p 8080:8080 --name test-agent yourusername/nosana-portfolio-agent:latest

# Check logs
docker logs test-agent

# Access at http://localhost:8080
# Stop test container
docker stop test-agent && docker rm test-agent
```

### 3. Push to Docker Hub

```bash
# Login to Docker Hub
docker login

# Push container
docker push skanda1/nosana-portfolio-agent:latest
```

### 4. Deploy on Nosana

#### Option A: Using Nosana CLI

1. Install Nosana CLI: `npm install -g @nosana/cli`
2. Get wallet address: `nosana address`
3. Get NOS and SOL tokens from Discord
4. Update `nos_job_def/nosana_mastra.json` with your Docker image
5. Deploy: `nosana job post --file nos_job_def/nosana_mastra.json --market nvidia-3060 --timeout 30`

#### Option B: Using Nosana Dashboard

1. Go to [Nosana Dashboard](https://dashboard.nosana.com/deploy)
2. Connect Phantom wallet
3. Get NOS and SOL from Discord
4. Update job definition with your Docker image
5. Select appropriate GPU market
6. Deploy!

### 5. Nosana Job Configuration

Update `nos_job_def/nosana_mastra.json`:

```json
{
  "ops": [
    {
      "id": "agents",
      "args": {
        "gpu": true,
        "image": "docker.io/yourusername/nosana-portfolio-agent:latest",
        "expose": [{ "port": 8080 }],
        "entrypoint": ["/bin/sh"]
      },
      "type": "container/run"
    }
  ],
  "meta": {
    "trigger": "dashboard",
    "system_requirements": { "required_vram": 4 }
  },
  "type": "container",
  "version": "0.1"
}
```

## 📝 Agent Features Demo

### Portfolio Analysis

```
User: "I own 100 Apple shares at $150 each and 50 Microsoft shares at $300 each"
Agent: Automatically analyzes portfolio, shows current values, gains/losses
```

### Real-time Prices

```
User: "What's the current price of Apple and Google?"
Agent: Fetches live prices from Yahoo Finance
```

### Benchmark Comparison

```
User: "How does my portfolio compare to the S&P 500?"
Agent: Compares performance against major market indices
```

### Portfolio Optimization

```
User: "Optimize my portfolio using Monte Carlo simulation"
Agent: Runs optimization analysis with efficient frontier
```

## 🎬 Video Demo Requirements

Create a 1-3 minute video showing:

1. Agent running on Nosana (show URL)
2. Portfolio analysis features
3. Real-time price fetching
4. Benchmark comparison
5. Optimization capabilities

## 📱 Social Media Post

Template for X/Twitter:

```
🚀 Just deployed my AI Portfolio Management Agent on @nosana_ai!

Features:
📊 Real-time stock analysis
📈 Benchmark comparison
🎯 Monte Carlo optimization
🧠 Natural language interface

Built with @mastra_ai framework
#NosanaAgentChallenge

Demo: [Your Nosana URL]
Code: [Your GitHub repo]
```

## 🏆 Submission Checklist

- [ ] Docker container built and pushed to Docker Hub
- [ ] Successfully deployed on Nosana network
- [ ] Agent accessible via public URL
- [ ] 1-3 minute demo video created
- [ ] X/Twitter post published with required tags
- [ ] GitHub repository updated with documentation
- [ ] Submitted via earn.superteam.fun

## 🎯 Challenge Categories

This agent targets **Advanced Level** with features including:

- Real-time market data integration
- Complex financial calculations
- AI-powered portfolio optimization
- Memory and personalization
- Professional-grade analysis tools

## 📞 Support

- Discord: [Nosana Discord](https://discord.gg/nosana-ai) - Builders Challenge Dev channel
- Documentation: [Mastra Docs](https://mastra.ai/en/docs)
- Nosana Docs: [docs.nosana.io](https://docs.nosana.io)

---

_Built for the Nosana Builders Challenge - showcasing AI agent development on decentralized infrastructure_
