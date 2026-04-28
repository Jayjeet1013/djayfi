/**
 * KeeperHub Service
 * Simulates decentralized trade execution with retry logic
 * Inspired by KeeperHub automation architecture
 */

export type ExecutionStatus =
  | "pending"
  | "executing"
  | "success"
  | "failed"
  | "retry";

export interface TradeData {
  asset: string;
  type: "buy" | "sell";
  amount: number;
  targetPrice?: number;
  slippage?: number;
}

export interface ExecutionLog {
  timestamp: string;
  level: "info" | "warn" | "error" | "success";
  message: string;
}

export interface ExecutionResult {
  status: ExecutionStatus;
  txHash: string | null;
  amount: number;
  executedPrice?: number;
  gasUsed?: number;
  timestamp: string;
  retries: number;
  logs: ExecutionLog[];
  error?: string;
}

// Configuration
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000; // 1 second between retries
const GAS_PRICE = 45; // gwei
const BASE_GAS = 150000; // base gas units

// Track execution state for simulation
const executionStore: Map<string, ExecutionResult> = new Map();

/**
 * Generate realistic transaction hash
 */
function generateTxHash(): string {
  const chars = "0123456789abcdef";
  let hash = "0x";
  for (let i = 0; i < 64; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return hash;
}

/**
 * Generate execution ID
 */
function generateExecutionId(): string {
  return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Simulate network request with potential failures
 * 70% success rate, 20% transient failures (retry-able), 10% permanent failures
 */
function simulateNetworkRequest(): {
  success: boolean;
  permanent: boolean;
} {
  const random = Math.random();

  if (random < 0.7) {
    return { success: true, permanent: false };
  } else if (random < 0.9) {
    // Transient failure (can retry)
    return { success: false, permanent: false };
  } else {
    // Permanent failure
    return { success: false, permanent: true };
  }
}

/**
 * Calculate gas cost
 */
function calculateGas(): { gasUsed: number; gasCost: number } {
  // Simulate variable gas usage (135k - 165k)
  const gasUsed = BASE_GAS + Math.floor(Math.random() * 30000);
  const gasCost = gasUsed * GAS_PRICE;
  return { gasUsed, gasCost };
}

/**
 * Add log entry
 */
function addLog(
  logs: ExecutionLog[],
  level: ExecutionLog["level"],
  message: string,
): void {
  logs.push({
    timestamp: new Date().toISOString(),
    level,
    message,
  });
}

/**
 * Wait for specified milliseconds
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute trade with retry logic
 */
export async function executeTrade(
  tradeData: TradeData,
): Promise<ExecutionResult> {
  const executionId = generateExecutionId();
  const startTime = new Date().toISOString();
  const logs: ExecutionLog[] = [];
  let retries = 0;
  let lastError: string | undefined;

  // Validate input
  if (!tradeData || !tradeData.asset || !tradeData.type || !tradeData.amount) {
    throw new Error("Invalid trade data: missing required fields");
  }

  addLog(
    logs,
    "info",
    `Execution started for ${tradeData.type} ${tradeData.amount} ${tradeData.asset}`,
  );
  addLog(
    logs,
    "info",
    `Execution ID: ${executionId}, Max retries: ${MAX_RETRIES}`,
  );

  // Retry loop
  while (retries <= MAX_RETRIES) {
    try {
      addLog(logs, "info", `Attempt ${retries + 1}/${MAX_RETRIES + 1}`);

      // Simulate network request
      const networkResult = simulateNetworkRequest();

      if (networkResult.success) {
        // Success case
        addLog(logs, "success", "Network request successful");

        // Calculate execution price (simulate slippage)
        const slippage = tradeData.slippage || 0.5;
        const priceVariance = (Math.random() - 0.5) * slippage;
        const executedPrice =
          (tradeData.targetPrice || 100) * (1 + priceVariance / 100);

        // Calculate gas
        const { gasUsed } = calculateGas();

        const txHash = generateTxHash();
        addLog(logs, "info", `Transaction hash: ${txHash}`);
        addLog(logs, "info", `Executed at price: $${executedPrice.toFixed(2)}`);
        addLog(logs, "info", `Gas used: ${gasUsed} units`);

        const result: ExecutionResult = {
          status: "success",
          txHash,
          amount: tradeData.amount,
          executedPrice,
          gasUsed,
          timestamp: startTime,
          retries,
          logs,
        };

        // Cache result
        executionStore.set(executionId, result);

        addLog(
          logs,
          "success",
          `Trade execution completed successfully. Execution ID: ${executionId}`,
        );

        return result;
      } else if (networkResult.permanent) {
        // Permanent failure
        lastError =
          "Permanent execution failure: Contract reverted or invalid parameters";
        addLog(logs, "error", lastError);
        addLog(
          logs,
          "error",
          "This is a permanent failure. No retry will resolve this.",
        );

        return {
          status: "failed",
          txHash: null,
          amount: tradeData.amount,
          timestamp: startTime,
          retries,
          logs,
          error: lastError,
        };
      } else {
        // Transient failure (retry-able)
        lastError = `Transient network error on attempt ${retries + 1}`;
        addLog(logs, "warn", lastError);

        if (retries < MAX_RETRIES) {
          addLog(logs, "info", `Retrying in ${RETRY_DELAY_MS}ms...`);
          await delay(RETRY_DELAY_MS);
          retries++;
        } else {
          addLog(logs, "error", "Max retries exceeded");
          return {
            status: "failed",
            txHash: null,
            amount: tradeData.amount,
            timestamp: startTime,
            retries,
            logs,
            error: `Failed after ${MAX_RETRIES} retries: ${lastError}`,
          };
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      lastError = errorMessage;
      addLog(logs, "error", `Exception occurred: ${errorMessage}`);

      if (retries < MAX_RETRIES) {
        retries++;
        addLog(
          logs,
          "info",
          `Retrying after exception (attempt ${retries + 1})`,
        );
        await delay(RETRY_DELAY_MS);
      } else {
        return {
          status: "failed",
          txHash: null,
          amount: tradeData.amount,
          timestamp: startTime,
          retries,
          logs,
          error: `Exception after ${MAX_RETRIES} retries: ${errorMessage}`,
        };
      }
    }
  }

  // Fallback (should not reach here)
  return {
    status: "failed",
    txHash: null,
    amount: tradeData.amount,
    timestamp: startTime,
    retries: MAX_RETRIES,
    logs,
    error: "Execution failed: Unknown reason",
  };
}

/**
 * Get execution status by ID
 */
export function getExecutionStatus(
  executionId: string,
): ExecutionResult | null {
  return executionStore.get(executionId) || null;
}

/**
 * Batch execute multiple trades
 */
export async function executeTradeBatch(
  trades: TradeData[],
): Promise<ExecutionResult[]> {
  const results: ExecutionResult[] = [];

  for (const trade of trades) {
    try {
      const result = await executeTrade(trade);
      results.push(result);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      results.push({
        status: "failed",
        txHash: null,
        amount: trade.amount,
        timestamp: new Date().toISOString(),
        retries: 0,
        logs: [
          {
            timestamp: new Date().toISOString(),
            level: "error",
            message: errorMessage,
          },
        ],
        error: errorMessage,
      });
    }
  }

  return results;
}

/**
 * Get execution statistics
 */
export function getExecutionStats(): {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  successRate: number;
} {
  const all = Array.from(executionStore.values());
  const successful = all.filter((e) => e.status === "success").length;
  const failed = all.filter((e) => e.status === "failed").length;

  return {
    totalExecutions: all.length,
    successfulExecutions: successful,
    failedExecutions: failed,
    successRate: all.length > 0 ? (successful / all.length) * 100 : 0,
  };
}

/**
 * Clear execution history
 */
export function clearExecutionHistory(): void {
  executionStore.clear();
}
