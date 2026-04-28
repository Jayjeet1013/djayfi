/**
 * Memory Agent
 * Stores and retrieves historical decisions, allocations, and execution results
 * Simulates 0G Storage (decentralized storage) architecture
 *
 * Future 0G Integration:
 * - Replace memoryStore Map with 0G Storage client
 * - Implement data serialization for decentralized storage
 * - Add merkle proof verification for data integrity
 * - Implement timestamped commits to blockchain
 */

export interface AllocationData {
  BTC: number;
  ETH: number;
  USDT: number;
}

export interface ExecutionData {
  status: "success" | "partial" | "failed";
  tradesExecuted: number;
  tradesFailed: number;
  totalGasUsed?: number;
  txHashes: string[];
}

export interface Decision {
  id: string;
  timestamp: string;
  riskLevel: "low" | "medium" | "high";
  allocation: AllocationData;
  reasoning: string;
  execution?: ExecutionData;
  notes?: string;
  performance?: {
    estimatedReturn?: number;
    actualReturn?: number;
    status: "pending" | "analyzed" | "complete";
  };
}

export interface MemoryStats {
  totalDecisions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageReturn?: number;
  riskProfile: {
    low: number;
    medium: number;
    high: number;
  };
}

// In-memory storage (simulates 0G Storage)
// TODO: Replace with actual 0G Storage client when available
// const zeroGClient = await ZeroGStorage.connect(config);
const memoryStore = new Map<string, Decision>();
let decisionCounter = 0;

/**
 * Generate unique decision ID
 * TODO: Integrate with 0G Storage's content-addressed storage for immutable IDs
 */
function generateDecisionId(): string {
  decisionCounter++;
  return `decision_${Date.now()}_${decisionCounter}`;
}

/**
 * Validate decision data structure
 */
function validateDecision(decision: Partial<Decision>): {
  valid: boolean;
  error?: string;
} {
  if (
    !decision.riskLevel ||
    !["low", "medium", "high"].includes(decision.riskLevel)
  ) {
    return { valid: false, error: "Invalid risk level" };
  }

  if (!decision.allocation || typeof decision.allocation !== "object") {
    return { valid: false, error: "Invalid allocation object" };
  }

  const { BTC, ETH, USDT } = decision.allocation;
  if (
    typeof BTC !== "number" ||
    typeof ETH !== "number" ||
    typeof USDT !== "number"
  ) {
    return {
      valid: false,
      error: "Allocation must contain numeric BTC, ETH, USDT",
    };
  }

  if (Math.abs(BTC + ETH + USDT - 100) > 0.1) {
    return { valid: false, error: "Allocation must sum to 100%" };
  }

  if (!decision.reasoning || typeof decision.reasoning !== "string") {
    return { valid: false, error: "Reasoning text required" };
  }

  return { valid: true };
}

/**
 * Save a decision to memory (0G Storage simulation)
 *
 * TODO: When integrated with 0G Storage:
 * - Serialize decision to CBOR format
 * - Calculate content hash (merkle root)
 * - Submit to 0G Storage network
 * - Receive storage proofs
 * - Store proof on blockchain for immutability
 */
export function saveDecision(
  decisionData: Omit<Decision, "id" | "timestamp">,
): {
  success: boolean;
  id?: string;
  error?: string;
} {
  try {
    // Validate input
    const validation = validateDecision(decisionData);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Create decision record with metadata
    const decision: Decision = {
      id: generateDecisionId(),
      timestamp: new Date().toISOString(),
      ...decisionData,
    };

    // Store in memory (simulating 0G Storage write)
    memoryStore.set(decision.id, decision);

    // TODO: Log to 0G Storage with verification
    // await zeroGClient.put(decision.id, JSON.stringify(decision));
    // const merkleProof = await zeroGClient.getMerkleProof(decision.id);
    // console.log(`Decision stored with proof: ${merkleProof}`);

    console.log(`[MemoryAgent] Decision saved: ${decision.id}`);

    return {
      success: true,
      id: decision.id,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`[MemoryAgent] Error saving decision:`, errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Update execution result for a decision
 * TODO: With 0G Storage, this would create an immutable audit log entry
 */
export function updateDecisionExecution(
  decisionId: string,
  executionData: ExecutionData,
): {
  success: boolean;
  error?: string;
} {
  try {
    const decision = memoryStore.get(decisionId);
    if (!decision) {
      return { success: false, error: "Decision not found" };
    }

    // Update execution data (immutable in real 0G Storage, but mutable in simulation)
    decision.execution = executionData;

    // TODO: With 0G Storage, append to immutable log:
    // const logEntry = {
    //   timestamp: new Date().toISOString(),
    //   event: "execution_completed",
    //   data: executionData
    // };
    // await zeroGClient.appendLog(decisionId, logEntry);

    console.log(`[MemoryAgent] Updated execution for ${decisionId}`);

    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: errorMessage };
  }
}

/**
 * Retrieve full decision history
 * TODO: Query 0G Storage with optional filters and pagination
 */
export function getHistory(options?: {
  riskLevel?: "low" | "medium" | "high";
  limit?: number;
  offset?: number;
}): Decision[] {
  try {
    let decisions = Array.from(memoryStore.values());

    // Filter by risk level if specified
    if (options?.riskLevel) {
      decisions = decisions.filter((d) => d.riskLevel === options.riskLevel);
    }

    // Sort by timestamp descending (most recent first)
    decisions.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    // Apply pagination
    const offset = options?.offset || 0;
    const limit = options?.limit || 100;

    // TODO: With 0G Storage:
    // const query = {
    //   filter: { riskLevel: options?.riskLevel },
    //   sort: { timestamp: -1 },
    //   limit,
    //   offset
    // };
    // return await zeroGClient.query(query);

    return decisions.slice(offset, offset + limit);
  } catch (error) {
    console.error("[MemoryAgent] Error retrieving history:", error);
    return [];
  }
}

/**
 * Get a specific decision by ID
 */
export function getDecision(decisionId: string): Decision | null {
  try {
    const decision = memoryStore.get(decisionId);

    // TODO: With 0G Storage:
    // const decision = await zeroGClient.get(decisionId);
    // const verified = await zeroGClient.verifyIntegrity(decisionId);
    // if (!verified) throw new Error("Data integrity verification failed");

    return decision || null;
  } catch (error) {
    console.error(
      `[MemoryAgent] Error retrieving decision ${decisionId}:`,
      error,
    );
    return null;
  }
}

/**
 * Calculate statistics from decision history
 */
export function getMemoryStats(): MemoryStats {
  try {
    const decisions = Array.from(memoryStore.values());

    const stats: MemoryStats = {
      totalDecisions: decisions.length,
      successfulExecutions: decisions.filter(
        (d) => d.execution?.status === "success",
      ).length,
      failedExecutions: decisions.filter(
        (d) => d.execution?.status === "failed",
      ).length,
      riskProfile: {
        low: decisions.filter((d) => d.riskLevel === "low").length,
        medium: decisions.filter((d) => d.riskLevel === "medium").length,
        high: decisions.filter((d) => d.riskLevel === "high").length,
      },
    };

    // Calculate average return if performance data exists
    const performanceData = decisions
      .filter((d) => d.performance?.actualReturn !== undefined)
      .map((d) => d.performance!.actualReturn!);

    if (performanceData.length > 0) {
      stats.averageReturn =
        performanceData.reduce((a, b) => a + b, 0) / performanceData.length;
    }

    // TODO: With 0G Storage:
    // const aggregateStats = await zeroGClient.aggregate({
    //   operations: [
    //     { $count: "totalDecisions" },
    //     { $match: { "execution.status": "success" }, $count: "successful" },
    //     { $group: { _id: "$riskLevel", count: { $sum: 1 } } }
    //   ]
    // });

    return stats;
  } catch (error) {
    console.error("[MemoryAgent] Error calculating stats:", error);
    return {
      totalDecisions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      riskProfile: { low: 0, medium: 0, high: 0 },
    };
  }
}

/**
 * Search decisions by criteria
 * TODO: Full-text search and complex queries with 0G Storage
 */
export function searchDecisions(criteria: {
  riskLevel?: "low" | "medium" | "high";
  status?: "success" | "failed" | "partial";
  fromDate?: Date;
  toDate?: Date;
}): Decision[] {
  try {
    let results = Array.from(memoryStore.values());

    if (criteria.riskLevel) {
      results = results.filter((d) => d.riskLevel === criteria.riskLevel);
    }

    if (criteria.status) {
      results = results.filter((d) => d.execution?.status === criteria.status);
    }

    if (criteria.fromDate) {
      results = results.filter(
        (d) => new Date(d.timestamp) >= criteria.fromDate!,
      );
    }

    if (criteria.toDate) {
      results = results.filter(
        (d) => new Date(d.timestamp) <= criteria.toDate!,
      );
    }

    // TODO: With 0G Storage:
    // const query = {
    //   $match: {
    //     ...(criteria.riskLevel && { riskLevel: criteria.riskLevel }),
    //     ...(criteria.status && { "execution.status": criteria.status }),
    //     ...(criteria.fromDate && { timestamp: { $gte: criteria.fromDate } }),
    //     ...(criteria.toDate && { timestamp: { $lte: criteria.toDate } })
    //   }
    // };
    // return await zeroGClient.aggregate([query]);

    return results.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  } catch (error) {
    console.error("[MemoryAgent] Error searching decisions:", error);
    return [];
  }
}

/**
 * Export memory to JSON format (for backup/analysis)
 * TODO: Export from 0G Storage with proofs
 */
export function exportMemory(): {
  success: boolean;
  data?: {
    decisions: Decision[];
    stats: MemoryStats;
    exportedAt: string;
  };
  error?: string;
} {
  try {
    const decisions = Array.from(memoryStore.values());
    const stats = getMemoryStats();

    return {
      success: true,
      data: {
        decisions,
        stats,
        exportedAt: new Date().toISOString(),
      },
    };

    // TODO: With 0G Storage:
    // const proof = await zeroGClient.getStorageProof();
    // return {
    //   success: true,
    //   data: {
    //     decisions,
    //     stats,
    //     proof,
    //     exportedAt: new Date().toISOString()
    //   }
    // };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: errorMessage };
  }
}

/**
 * Clear all memory (for testing/reset)
 * WARNING: Destructive operation
 */
export function clearMemory(): { success: boolean } {
  try {
    const count = memoryStore.size;
    memoryStore.clear();
    decisionCounter = 0;

    console.log(`[MemoryAgent] Cleared ${count} decisions from memory`);

    // TODO: With 0G Storage, archive historical data:
    // await zeroGClient.archive();

    return { success: true };
  } catch (error) {
    console.error("[MemoryAgent] Error clearing memory:", error);
    return { success: false };
  }
}

/**
 * Get memory usage statistics
 */
export function getMemoryUsage(): {
  decisionsStored: number;
  memorySize: string;
} {
  const decisionsStored = memoryStore.size;

  // Rough estimate of memory usage in bytes
  let memorySize = 0;
  memoryStore.forEach((decision) => {
    memorySize += JSON.stringify(decision).length;
  });

  return {
    decisionsStored,
    memorySize:
      memorySize < 1024
        ? `${memorySize} B`
        : memorySize < 1024 * 1024
          ? `${(memorySize / 1024).toFixed(2)} KB`
          : `${(memorySize / (1024 * 1024)).toFixed(2)} MB`,
  };
}
