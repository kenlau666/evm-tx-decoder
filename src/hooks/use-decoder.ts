import { useCallback } from 'react';
import type {
  RawTransactionInput,
  DecodedTransaction,
  ChainId,
  DecodeStatus,
} from '@/types';
import { parseTransaction, decodeCalldata, generateSummary } from '@/services/decoder';
import { getProtocol } from '@/services/protocol';

/**
 * Hook for decoding transactions.
 * Returns a decode function that processes raw transaction input.
 */
export function useDecoder() {
  const decode = useCallback(
    async (
      input: RawTransactionInput,
      chainId: ChainId
    ): Promise<DecodedTransaction> => {
      // Parse the raw transaction
      const parsed = parseTransaction(input.hex);

      // Use provided chainId or fallback to parsed chainId
      const effectiveChainId = input.chainId ?? parsed.chainId ?? chainId;

      // Decode calldata if present
      const functionCall =
        parsed.data && parsed.data !== '0x'
          ? decodeCalldata(parsed.data)
          : null;

      // Look up protocol info
      const contractLabel =
        parsed.to && effectiveChainId
          ? getProtocol(parsed.to, effectiveChainId)
          : null;

      // Generate human-readable summary
      const summary = generateSummary(functionCall, parsed.value);

      // Determine decode status
      let status: DecodeStatus;
      if (functionCall) {
        status = { type: 'success' };
      } else if (parsed.data && parsed.data.length >= 10) {
        // Has selector but couldn't decode
        status = {
          type: 'unknown-function',
          selector: parsed.data.slice(0, 10).toLowerCase() as `0x${string}`,
        };
      } else if (!contractLabel && parsed.to) {
        status = { type: 'unknown-protocol' };
      } else {
        status = { type: 'success' };
      }

      return {
        parsed,
        functionCall,
        protocol: contractLabel?.protocol ?? null,
        contractLabel,
        summary,
        status,
      };
    },
    []
  );

  return { decode };
}
