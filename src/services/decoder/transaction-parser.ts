import { parseTransaction as viemParseTransaction } from 'viem';
import type { Hex, ParsedTransaction, ChainId } from '@/types';

/**
 * Parse raw transaction hex into structured fields.
 * Handles EIP-1559, legacy transactions, and calldata-only input.
 */
export function parseTransaction(hex: Hex): ParsedTransaction {
  // Try to parse as a signed transaction first
  try {
    const tx = viemParseTransaction(hex);

    // Determine transaction type
    let txType: ParsedTransaction['txType'];
    if (tx.type === 'eip1559') {
      txType = 'eip1559';
    } else if (tx.type === 'eip2930') {
      txType = 'eip2930';
    } else {
      txType = 'legacy';
    }

    // Build gas info based on transaction type (only if gas limit exists)
    let gas: ParsedTransaction['gas'];
    if (tx.gas !== undefined) {
      gas = { limit: tx.gas };

      if (tx.type === 'eip1559' && 'maxFeePerGas' in tx) {
        gas.maxFeePerGas = tx.maxFeePerGas;
        gas.maxPriorityFeePerGas = tx.maxPriorityFeePerGas;
      } else if ('gasPrice' in tx && tx.gasPrice !== undefined) {
        gas.gasPrice = tx.gasPrice;
      }
    }

    return {
      to: (tx.to as Hex) ?? null,
      value: tx.value ?? 0n,
      data: (tx.data ?? '0x') as Hex,
      chainId: isValidChainId(tx.chainId) ? tx.chainId : null,
      txType,
      gas,
      from: undefined, // Cannot recover from unsigned parsing
      nonce: tx.nonce,
    };
  } catch {
    // If parsing as transaction fails, treat as calldata-only
    return parseAsCalldata(hex);
  }
}

/**
 * Parse input as raw calldata (not a full transaction)
 */
function parseAsCalldata(hex: Hex): ParsedTransaction {
  return {
    to: null,
    value: 0n,
    data: hex,
    chainId: null,
    txType: 'calldata-only',
    gas: undefined,
    from: undefined,
    nonce: undefined,
  };
}

/**
 * Check if a chain ID is one of our supported chains
 */
function isValidChainId(chainId: number | undefined): chainId is ChainId {
  if (chainId === undefined) return false;
  const validChainIds: ChainId[] = [1, 10, 137, 42161, 8453, 43114, 56];
  return validChainIds.includes(chainId as ChainId);
}
