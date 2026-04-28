/**
 * Strategy Agent
 * Generates portfolio allocation based on risk level
 */

export type RiskLevel = "low" | "medium" | "high";

interface AssetAllocation {
  symbol: string;
  name: string;
  percentage: number;
  rationale: string;
}

export interface PortfolioStrategy {
  riskLevel: RiskLevel;
  timestamp: string;
  allocation: {
    BTC: AssetAllocation;
    ETH: AssetAllocation;
    USDT: AssetAllocation;
  };
  totalAllocation: number;
  reasoning: string;
  disclaimer: string;
}

/**
 * Generate human-like reasoning based on risk level
 */
function generateReasoning(riskLevel: RiskLevel): string {
  const reasoningMap: Record<RiskLevel, string[]> = {
    low: [
      "Given current market conditions and your conservative approach, I'm prioritizing capital preservation with a strong stablecoin position. Bitcoin represents our core risk asset with modest exposure—it offers store-of-value properties without the complexity of higher-volatility altcoins. The significant USDT allocation provides a buffer against market downturns and maintains optionality for opportunistic entries.",
      "For a conservative portfolio, I'm emphasizing downside protection over growth. Bitcoin's established market position and institutional adoption make it suitable for cautious investors. Ethereum's exposure is minimal to reduce volatility exposure. Tether provides liquidity and reduces the need to exit positions during market stress.",
      "I'm recommending a capital-preservation strategy with defensive positioning. Bitcoin allocation reflects its role as digital gold rather than a growth engine. The minimal Ethereum exposure avoids concentration risk in smart contract platforms. The substantial stablecoin reserve ensures we're prepared for volatility without forced selling.",
    ],
    medium: [
      "With a balanced risk approach, I'm allocating across assets that offer both stability and growth potential. Bitcoin provides the core holding—its proven track record and dominant market position make it suitable for long-term appreciation. Ethereum adds growth exposure through DeFi ecosystem participation. This composition aims to capture upside while maintaining reasonable downside protection.",
      "I'm constructing a growth-with-stability framework. Bitcoin allocation reflects confidence in crypto adoption rates. Ethereum exposure captures the network effect in decentralized finance. The stablecoin reserve allows tactical flexibility without disrupting the core positions. This balanced approach aligns with moderate risk tolerance.",
      "My analysis suggests a 45/30/25 split that captures meaningful upside while maintaining prudent risk management. Bitcoin's fundamental value proposition and technical superiority warrant the largest allocation. Ethereum offers exposure to innovation but with secondary allocation. The stablecoin portion provides rebalancing opportunities and reduces sequence-of-returns risk.",
    ],
    high: [
      "For an aggressive investor, I'm maximizing exposure to growth assets. Bitcoin's potential continues to expand as institutional adoption accelerates. Ethereum offers concentrated exposure to the highest-conviction narrative in cryptocurrency—decentralized infrastructure. While more volatile, this allocation targets substantial upside. The modest stablecoin reserve maintains minimal dry powder for tactical entries.",
      "Given your higher risk tolerance, I'm pursuing an offensive strategy. Bitcoin allocation reflects my confidence in the macro cryptocurrency thesis. Ethereum receives substantial allocation given its network effects and developer ecosystem. The minimal stablecoin position avoids excessive drag from safe assets. This portfolio positions for significant appreciation in a bull market scenario.",
      "I'm implementing an aggressive growth allocation that assumes crypto market expansion. Bitcoin, as the market leader, receives the largest portion—its asymmetric risk-reward appeals to growth-oriented investors. Ethereum exposure captures exponential opportunities in smart contract deployment. The reduced stablecoin buffer reflects comfort with volatility and conviction in appreciation.",
    ],
  };

  const reasonings = reasoningMap[riskLevel];
  return reasonings[Math.floor(Math.random() * reasonings.length)];
}

/**
 * Generate portfolio allocation based on risk level
 */
export function generateStrategy(riskLevel: RiskLevel): PortfolioStrategy {
  const timestamp = new Date().toISOString();

  // Define allocation percentages for each risk level
  const allocationMap: Record<RiskLevel, Record<string, number>> = {
    low: {
      BTC: 30,
      ETH: 10,
      USDT: 60,
    },
    medium: {
      BTC: 45,
      ETH: 30,
      USDT: 25,
    },
    high: {
      BTC: 55,
      ETH: 40,
      USDT: 5,
    },
  };

  const allocations = allocationMap[riskLevel];

  const strategy: PortfolioStrategy = {
    riskLevel,
    timestamp,
    allocation: {
      BTC: {
        symbol: "BTC",
        name: "Bitcoin",
        percentage: allocations.BTC,
        rationale:
          riskLevel === "low"
            ? "Core store-of-value position with proven market resilience"
            : riskLevel === "medium"
              ? "Primary growth driver with strong fundamentals and institutional adoption"
              : "Maximum exposure to the leading cryptocurrency with asymmetric upside",
      },
      ETH: {
        symbol: "ETH",
        name: "Ethereum",
        percentage: allocations.ETH,
        rationale:
          riskLevel === "low"
            ? "Minimal exposure to distributed computing platform for diversification"
            : riskLevel === "medium"
              ? "Meaningful allocation to capture DeFi ecosystem growth and smart contract expansion"
              : "Substantial allocation to higher-conviction narrative of decentralized infrastructure",
      },
      USDT: {
        symbol: "USDT",
        name: "Tether (Stablecoin)",
        percentage: allocations.USDT,
        rationale:
          riskLevel === "low"
            ? "Significant reserve providing stability and rebalancing flexibility"
            : riskLevel === "medium"
              ? "Tactical buffer enabling opportunistic deployment and volatility management"
              : "Minimal reserve maintaining offensive positioning while preserving optionality",
      },
    },
    totalAllocation: 100,
    reasoning: generateReasoning(riskLevel),
    disclaimer:
      "This allocation is a simulation based on risk level. Not financial advice. Actual investments require thorough due diligence and professional guidance.",
  };

  return strategy;
}

/**
 * Adjust allocation based on market conditions
 */
export function adjustStrategyForMarket(
  baseStrategy: PortfolioStrategy,
  btcChange24h: number,
  ethChange24h: number,
): PortfolioStrategy {
  const adjusted = { ...baseStrategy };

  // If BTC is up more than 5% in 24h, slightly reduce exposure (take profits)
  if (btcChange24h > 5) {
    const reductionAmount = baseStrategy.allocation.BTC.percentage * 0.05;
    adjusted.allocation.BTC.percentage -= reductionAmount;
    adjusted.allocation.USDT.percentage += reductionAmount;
  }

  // If BTC is down more than 5% in 24h, slightly increase exposure (buy dip)
  if (btcChange24h < -5) {
    const increaseAmount = baseStrategy.allocation.BTC.percentage * 0.05;
    adjusted.allocation.BTC.percentage += increaseAmount;
    adjusted.allocation.USDT.percentage -= increaseAmount;
  }

  return adjusted;
}

/**
 * Validate allocation sums to 100%
 */
export function validateAllocation(strategy: PortfolioStrategy): boolean {
  const total = Object.values(strategy.allocation).reduce(
    (sum, asset) => sum + asset.percentage,
    0,
  );

  // Allow for floating point rounding
  return Math.abs(total - 100) < 0.1;
}
