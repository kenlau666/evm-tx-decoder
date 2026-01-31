import { decodeFunctionData, toFunctionSignature } from 'viem';
import type { Hex, DecodedFunctionCall, DecodedArgument } from '@/types';
import { getBySelector } from '@/services/abi';

/**
 * Extract 4-byte function selector from calldata.
 */
export function extractSelector(data: Hex): Hex | null {
  if (data.length < 10) {
    return null; // Need at least 0x + 4 bytes (8 hex chars)
  }
  return data.slice(0, 10).toLowerCase() as Hex;
}

/**
 * Decode calldata into function name and parameters.
 * Returns null for unknown selectors or decode failures.
 */
export function decodeCalldata(data: Hex): DecodedFunctionCall | null {
  const selector = extractSelector(data);
  if (!selector) {
    return null;
  }

  const abiItems = getBySelector(selector);
  if (abiItems.length === 0) {
    return null; // Unknown selector
  }

  // Try each matching ABI until one succeeds
  for (const abiItem of abiItems) {
    try {
      const abi = [abiItem] as const;
      const decoded = decodeFunctionData({ abi, data });

      const signature = toFunctionSignature(abiItem);
      const args = formatArguments(abiItem, decoded.args);

      return {
        name: decoded.functionName,
        signature,
        selector,
        args,
        abi,
      };
    } catch {
      // Try next ABI if this one fails
      continue;
    }
  }

  return null; // All ABIs failed to decode
}

/**
 * Format decoded arguments into DecodedArgument array.
 */
function formatArguments(
  abiItem: { inputs?: readonly { name: string; type: string }[] },
  args: readonly unknown[] | undefined
): DecodedArgument[] {
  if (!args || !abiItem.inputs) {
    return [];
  }

  return abiItem.inputs.map((input, index) => ({
    name: input.name || `arg${index}`,
    type: input.type,
    value: args[index],
    formatted: formatValue(args[index], input.type),
  }));
}

/**
 * Format a value for display based on its type.
 */
function formatValue(value: unknown, type: string): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'bigint') {
    return value.toString();
  }

  if (Array.isArray(value)) {
    return `[${value.map((v) => formatValue(v, type.replace('[]', ''))).join(', ')}]`;
  }

  if (typeof value === 'object') {
    // Handle tuple types
    return JSON.stringify(value, (_, v) =>
      typeof v === 'bigint' ? v.toString() : v
    );
  }

  return String(value);
}
