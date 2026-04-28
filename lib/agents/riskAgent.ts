/**
 * Risk Agent
 * Validates and adjusts portfolio allocations to ensure safety limits
 */

export interface AllocationInput {
  BTC: number;
  ETH: number;
  USDT: number;
}

export interface AllocationResult {
  original: AllocationInput;
  adjusted: AllocationInput;
  isSafe: boolean;
  adjustments: {
    BTC: { changed: boolean; reason: string; value: number };
    ETH: { changed: boolean; reason: string; value: number };
    USDT: { changed: boolean; reason: string; value: number };
  };
  warnings: string[];
  summary: string;
}

// Safety constraints
const MAX_ASSET_ALLOCATION = 70; // Max percentage per asset
const MIN_ASSET_ALLOCATION = 0; // Min percentage per asset
const TOTAL_ALLOCATION = 100; // Target total
const TOLERANCE = 0.1; // Floating point tolerance

/**
 * Validate basic allocation structure
 */
function validateStructure(allocation: AllocationInput): {
  valid: boolean;
  error?: string;
} {
  if (!allocation || typeof allocation !== "object") {
    return { valid: false, error: "Invalid allocation object" };
  }

  const requiredAssets = ["BTC", "ETH", "USDT"];
  for (const asset of requiredAssets) {
    if (!(asset in allocation)) {
      return {
        valid: false,
        error: `Missing asset: ${asset}`,
      };
    }

    const value = allocation[asset as keyof AllocationInput];
    if (typeof value !== "number" || value < 0 || value > 100) {
      return {
        valid: false,
        error: `Invalid value for ${asset}: must be 0-100`,
      };
    }
  }

  return { valid: true };
}

/**
 * Check if allocation sums to 100% (with tolerance)
 */
function validateTotal(allocation: AllocationInput): {
  valid: boolean;
  total: number;
  error?: string;
} {
  const total = allocation.BTC + allocation.ETH + allocation.USDT;

  if (Math.abs(total - TOTAL_ALLOCATION) > TOLERANCE) {
    return {
      valid: false,
      total,
      error: `Allocation must sum to 100%. Current total: ${total.toFixed(2)}%`,
    };
  }

  return { valid: true, total };
}

/**
 * Check if any asset exceeds maximum allocation
 */
function checkRiskLimits(allocation: AllocationInput): {
  safe: boolean;
  violations: string[];
} {
  const violations: string[] = [];

  if (allocation.BTC > MAX_ASSET_ALLOCATION) {
    violations.push(
      `Bitcoin ${allocation.BTC}% exceeds limit of ${MAX_ASSET_ALLOCATION}%`,
    );
  }

  if (allocation.ETH > MAX_ASSET_ALLOCATION) {
    violations.push(
      `Ethereum ${allocation.ETH}% exceeds limit of ${MAX_ASSET_ALLOCATION}%`,
    );
  }

  if (allocation.USDT > MAX_ASSET_ALLOCATION) {
    violations.push(
      `USDT ${allocation.USDT}% exceeds limit of ${MAX_ASSET_ALLOCATION}%`,
    );
  }

  return {
    safe: violations.length === 0,
    violations,
  };
}

/**
 * Rebalance allocation to meet safety limits
 */
function rebalanceAllocation(allocation: AllocationInput): AllocationInput {
  const adjusted = { ...allocation };
  let totalExcess = 0;
  let availableReduction = 0;

  // Identify assets exceeding limits and cap them
  if (adjusted.BTC > MAX_ASSET_ALLOCATION) {
    totalExcess += adjusted.BTC - MAX_ASSET_ALLOCATION;
    adjusted.BTC = MAX_ASSET_ALLOCATION;
  }

  if (adjusted.ETH > MAX_ASSET_ALLOCATION) {
    totalExcess += adjusted.ETH - MAX_ASSET_ALLOCATION;
    adjusted.ETH = MAX_ASSET_ALLOCATION;
  }

  if (adjusted.USDT > MAX_ASSET_ALLOCATION) {
    totalExcess += adjusted.USDT - MAX_ASSET_ALLOCATION;
    adjusted.USDT = MAX_ASSET_ALLOCATION;
  }

  // If we have excess, redistribute to assets below the limit
  if (totalExcess > TOLERANCE) {
    // Increase USDT first (safest asset)
    const usatCapacity = MAX_ASSET_ALLOCATION - adjusted.USDT;
    if (usatCapacity > 0) {
      const addToUsdt = Math.min(totalExcess, usatCapacity);
      adjusted.USDT += addToUsdt;
      totalExcess -= addToUsdt;
    }

    // Then increase ETH if needed
    if (totalExcess > TOLERANCE) {
      const ethCapacity = MAX_ASSET_ALLOCATION - adjusted.ETH;
      if (ethCapacity > 0) {
        const addToEth = Math.min(totalExcess, ethCapacity);
        adjusted.ETH += addToEth;
        totalExcess -= addToEth;
      }
    }

    // Finally increase BTC if needed
    if (totalExcess > TOLERANCE) {
      const btcCapacity = MAX_ASSET_ALLOCATION - adjusted.BTC;
      if (btcCapacity > 0) {
        const addToBtc = Math.min(totalExcess, btcCapacity);
        adjusted.BTC += addToBtc;
        totalExcess -= addToBtc;
      }
    }
  }

  // Normalize to exactly 100% if needed
  const total = adjusted.BTC + adjusted.ETH + adjusted.USDT;
  if (Math.abs(total - 100) > TOLERANCE) {
    const diff = 100 - total;
    // Add remaining to USDT (most stable)
    adjusted.USDT += diff;
  }

  return adjusted;
}

/**
 * Identify what changed during adjustment
 */
function identifyChanges(
  original: AllocationInput,
  adjusted: AllocationInput,
): AllocationResult["adjustments"] {
  const tolerance = 0.01;

  return {
    BTC: {
      changed: Math.abs(original.BTC - adjusted.BTC) > tolerance,
      reason:
        original.BTC > MAX_ASSET_ALLOCATION
          ? `Reduced from ${original.BTC}% to meet ${MAX_ASSET_ALLOCATION}% safety limit`
          : original.BTC !== adjusted.BTC
            ? "Adjusted to rebalance portfolio"
            : "No change needed",
      value: adjusted.BTC,
    },
    ETH: {
      changed: Math.abs(original.ETH - adjusted.ETH) > tolerance,
      reason:
        original.ETH > MAX_ASSET_ALLOCATION
          ? `Reduced from ${original.ETH}% to meet ${MAX_ASSET_ALLOCATION}% safety limit`
          : original.ETH !== adjusted.ETH
            ? "Adjusted to rebalance portfolio"
            : "No change needed",
      value: adjusted.ETH,
    },
    USDT: {
      changed: Math.abs(original.USDT - adjusted.USDT) > tolerance,
      reason:
        original.USDT !== adjusted.USDT
          ? `Adjusted to ${adjusted.USDT}% to rebalance and meet safety limits`
          : "No change needed",
      value: adjusted.USDT,
    },
  };
}

/**
 * Generate risk assessment warnings
 */
function generateWarnings(
  adjusted: AllocationInput,
  violations: string[],
): string[] {
  const warnings: string[] = [];

  // Add violation warnings
  warnings.push(...violations);

  // Concentration warnings
  if (adjusted.BTC + adjusted.ETH > 80) {
    warnings.push(
      "High concentration in cryptocurrencies (BTC + ETH > 80%). Consider increasing stablecoin buffer.",
    );
  }

  if (adjusted.USDT < 10) {
    warnings.push(
      "Low stablecoin reserve. Consider maintaining at least 10% for volatility management.",
    );
  }

  // Diversification warnings
  if (adjusted.ETH < 5) {
    warnings.push(
      "Low Ethereum exposure. Consider increasing for DeFi ecosystem participation.",
    );
  }

  return warnings;
}

/**
 * Generate summary of risk assessment
 */
function generateSummary(
  allocation: AllocationInput,
  adjusted: AllocationInput,
  isSafe: boolean,
): string {
  if (isSafe) {
    return `Portfolio allocation is safe and balanced: BTC ${adjusted.BTC}% | ETH ${adjusted.ETH}% | USDT ${adjusted.USDT}%`;
  }

  const changes = [];
  if (adjusted.BTC !== allocation.BTC) changes.push("Bitcoin");
  if (adjusted.ETH !== allocation.ETH) changes.push("Ethereum");
  if (adjusted.USDT !== allocation.USDT) changes.push("Stablecoin");

  return `Rebalanced allocation to meet safety limits. Adjusted: ${changes.join(", ")}. New allocation: BTC ${adjusted.BTC}% | ETH ${adjusted.ETH}% | USDT ${adjusted.USDT}%`;
}

/**
 * Main function: Validate and adjust allocation
 */
export function assessAndAdjustAllocation(
  allocation: AllocationInput,
): AllocationResult {
  // Step 1: Validate structure
  const structureCheck = validateStructure(allocation);
  if (!structureCheck.valid) {
    throw new Error(structureCheck.error);
  }

  // Step 2: Check if totals to 100%
  const totalCheck = validateTotal(allocation);
  if (!totalCheck.valid) {
    throw new Error(totalCheck.error);
  }

  // Step 3: Check risk limits
  const riskCheck = checkRiskLimits(allocation);

  // Step 4: Rebalance if needed
  const adjusted = riskCheck.safe
    ? { ...allocation }
    : rebalanceAllocation(allocation);

  // Step 5: Identify changes
  const changes = identifyChanges(allocation, adjusted);

  // Step 6: Generate warnings
  const warnings = generateWarnings(adjusted, riskCheck.violations);

  // Step 7: Generate summary
  const summary = generateSummary(allocation, adjusted, riskCheck.safe);

  return {
    original: allocation,
    adjusted,
    isSafe: riskCheck.safe,
    adjustments: changes,
    warnings,
    summary,
  };
}

/**
 * Quick safety check without detailed reporting
 */
export function isSafeAllocation(allocation: AllocationInput): boolean {
  try {
    const structureCheck = validateStructure(allocation);
    if (!structureCheck.valid) return false;

    const totalCheck = validateTotal(allocation);
    if (!totalCheck.valid) return false;

    const riskCheck = checkRiskLimits(allocation);
    return riskCheck.safe;
  } catch {
    return false;
  }
}

/**
 * Get maximum safe allocation for a single asset
 */
export function getMaxSafeAllocation(asset: "BTC" | "ETH" | "USDT"): number {
  return MAX_ASSET_ALLOCATION;
}
