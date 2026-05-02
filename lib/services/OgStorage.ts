import { Indexer, MemData } from "@0gfoundation/0g-ts-sdk";
import { ethers } from "ethers";

const RPC_URL = "https://evmrpc-testnet.0g.ai";
const INDEXER_RPC = "https://indexer-storage-testnet-turbo.0g.ai";

const provider = new ethers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

const indexer = new Indexer(INDEXER_RPC);

// 🔥 SAVE DATA TO 0G
export async function savePortfolio(data: any) {
  try {
    const encoded = new TextEncoder().encode(JSON.stringify(data));

    const memData = new MemData(encoded);

    await memData.merkleTree();

    const [tx, err] = await indexer.upload(memData, RPC_URL, signer);

    if (err) {
      throw err instanceof Error ? err : new Error(String(err));
    }

    let rootHash = "unknown";

    if (tx && "rootHash" in tx) {
      rootHash = tx.rootHash;
    } else if (tx && "rootHashes" in tx && tx.rootHashes.length > 0) {
      rootHash = tx.rootHashes[0];
    }

    return {
      success: true,
      rootHash,
    };
  } catch (error) {
    console.error("0G Storage Error:", error);
    return { success: false };
  }
}
