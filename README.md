# DJayFi 🚀

**Autonomous AI Agent for DeFi Portfolio Management**

---

## 🧠 About the Project

DJayFi is an AI-powered DeFi agent that helps users manage their crypto portfolio in a smart and simple way.

It can:

* Analyze market data
* Suggest portfolio allocation
* Explain its decisions
* Simulate trade execution
* Store past decisions and learn over time

The goal of DJayFi is to show how AI agents can be used in Web3 to make better financial decisions.

---

## ⚙️ How It Works

DJayFi is built using a **multi-agent system**, where each agent has a specific role:

* **Market Agent** → Fetches crypto prices
* **Strategy Agent** → Decides portfolio allocation based on risk
* **Risk Agent** → Ensures safe investment distribution
* **Execution Agent** → Simulates trade execution
* **Memory Agent** → Stores history and past decisions

### Flow:

1. User selects risk level
2. Clicks “Analyze Portfolio”
3. AI generates portfolio allocation
4. AI explains reasoning
5. User clicks “Execute Trade”
6. System simulates execution
7. Data is stored and shown in history

---

## 🧩 Features

* 🤖 AI-based portfolio suggestions
* 🧠 Human-like reasoning explanations
* 🔄 Multi-agent architecture
* 📊 Portfolio visualization
* 📜 History tracking (memory)
* ⚡ Simulated onchain execution

---

## 🔌 Tech Stack

* **Frontend:** Next.js, Tailwind CSS
* **Backend:** Next.js API routes
* **AI Logic:** Custom agent system
* **Memory:** 0G-style storage (simulated)
* **Execution:** KeeperHub-style execution (simulated)

---

## 🎥 Demo Focus

This project demonstrates:

* How AI agents can collaborate
* How decisions are made step-by-step
* How execution and memory work together

---

## 🚀 Future Improvements

* Integrate real 0G SDK for storage and compute
* Connect real KeeperHub for onchain execution
* Add real-time market data and advanced strategies
* Support more tokens and DeFi protocols

---

## 🏆 Goal

The main goal of DJayFi is to build a simple but powerful AI system that can:

* Think
* Decide
* Act
* Learn

All in a decentralized environment.

---

Architecture Diagram

                    ┌────────────────────────────┐
                    │        Frontend UI         │
                    │  (Next.js + Tailwind)      │
                    │                            │
                    │  - Dashboard               │
                    │  - Portfolio View          │
                    │  - Reasoning Panel         │
                    │  - History Logs            │
                    └────────────┬───────────────┘
                                 │
                                 │ API Calls
                                 ▼
                    ┌────────────────────────────┐
                    │        API Layer           │
                    │   (Next.js API Routes)     │
                    │                            │
                    │  /api/analyze              │
                    │  /api/execute              │
                    │  /api/history              │
                    └────────────┬───────────────┘
                                 │
                                 ▼
              ┌────────────────────────────────────┐
              │         Agent Orchestrator         │
              │   (Controls flow between agents)   │
              └────────────┬────────────┬──────────┘
                           │            │
                           ▼            ▼

        ┌──────────────────────┐   ┌──────────────────────┐
        │    Market Agent      │   │    Strategy Agent    │
        │----------------------│   │----------------------│
        │ Fetch crypto prices  │   │ Decide allocation    │
        │ (CoinGecko API)      │   │ Based on risk level  │
        └────────────┬─────────┘   └────────────┬─────────┘
                     │                          │
                     ▼                          ▼
                ┌────────────────────────────────────┐
                │           Risk Agent               │
                │------------------------------------│
                │ Validate & adjust portfolio        │
                │ Ensure safe allocation limits      │
                └────────────┬───────────────────────┘
                             │
                             ▼
                ┌────────────────────────────────────┐
                │     Execution Agent (KeeperHub)    │
                │------------------------------------│
                │ Simulate transaction execution     │
                │ Retry logic + txHash + logs        │
                └────────────┬───────────────────────┘
                             │
                             ▼
                ┌────────────────────────────────────┐
                │     Memory Agent (0G Storage)      │
                │------------------------------------│
                │ Save decisions & history           │
                │ Persistent learning simulation     │
                └────────────────────────────────────┘
