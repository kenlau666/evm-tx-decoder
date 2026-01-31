import type {
  DecodedFunctionCall,
  TransactionSummary,
  TokenAmount,
} from '@/types';
import { getActionMapping, getActionByFunctionName } from '@/data/action-mappings';

/**
 * Generate a human-readable summary from a decoded function call.
 */
export function generateSummary(
  functionCall: DecodedFunctionCall | null,
  ethValue?: bigint
): TransactionSummary {
  // Handle null/unknown function
  if (!functionCall) {
    return createUnknownSummary(ethValue);
  }

  // Try to get action mapping by selector
  const mapping = getActionMapping(functionCall.selector);
  const action = mapping?.action ?? getActionByFunctionName(functionCall.name);

  // Generate title from template or function name
  const title = mapping
    ? fillTemplate(mapping.template, functionCall)
    : generateFallbackTitle(functionCall);

  // Extract details from arguments
  const details = extractDetails(functionCall);

  // Add ETH value if present
  if (ethValue && ethValue > 0n) {
    details['ETH Value'] = formatEthValue(ethValue);
  }

  return {
    title,
    action,
    tokensIn: [], // Token resolution happens at a higher level
    tokensOut: [],
    ethValue: ethValue && ethValue > 0n ? formatEthValue(ethValue) : undefined,
    details,
  };
}

/**
 * Create summary for unknown/unparseable transactions.
 */
function createUnknownSummary(ethValue?: bigint): TransactionSummary {
  const hasValue = ethValue && ethValue > 0n;

  return {
    title: hasValue ? `Send ${formatEthValue(ethValue)} ETH` : 'Unknown Transaction',
    action: 'unknown',
    tokensIn: [],
    tokensOut: [],
    ethValue: hasValue ? formatEthValue(ethValue) : undefined,
    details: {},
  };
}

/**
 * Fill template with values from decoded arguments.
 */
function fillTemplate(template: string, functionCall: DecodedFunctionCall): string {
  let result = template;

  for (const arg of functionCall.args) {
    const placeholder = `{${arg.name}}`;
    if (result.includes(placeholder)) {
      result = result.replace(placeholder, formatArgValue(arg.formatted, arg.type));
    }
  }

  // Clean up any unfilled placeholders
  result = result.replace(/\{[^}]+\}/g, '...');

  return result;
}

/**
 * Generate fallback title from function name.
 */
function generateFallbackTitle(functionCall: DecodedFunctionCall): string {
  // Convert camelCase to Title Case
  const name = functionCall.name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();

  return name;
}

/**
 * Format argument value for display.
 */
function formatArgValue(formatted: string, type: string): string {
  // Truncate long addresses
  if (type === 'address' && formatted.length === 42) {
    return `${formatted.slice(0, 6)}...${formatted.slice(-4)}`;
  }

  // Truncate very long values
  if (formatted.length > 20) {
    return `${formatted.slice(0, 17)}...`;
  }

  return formatted;
}

/**
 * Extract key details from function arguments.
 */
function extractDetails(functionCall: DecodedFunctionCall): Record<string, string> {
  const details: Record<string, string> = {};

  for (const arg of functionCall.args) {
    // Skip very long values in details
    if (arg.formatted.length > 100) {
      continue;
    }

    // Format the key nicely
    const key = arg.name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (s) => s.toUpperCase())
      .trim();

    details[key] = arg.formatted;
  }

  return details;
}

/**
 * Format ETH value for display.
 */
function formatEthValue(value: bigint): string {
  const eth = Number(value) / 1e18;
  if (eth < 0.0001) {
    return `${value.toString()} wei`;
  }
  return `${eth.toFixed(eth < 1 ? 6 : 4)} ETH`;
}

/**
 * Create a token amount object (helper for higher-level code).
 */
export function createTokenAmount(
  raw: bigint,
  symbol: string,
  decimals: number
): Omit<TokenAmount, 'token'> & { formatted: string } {
  const divisor = 10n ** BigInt(decimals);
  const whole = raw / divisor;
  const fraction = raw % divisor;

  let formatted: string;
  if (fraction === 0n) {
    formatted = `${whole.toLocaleString()} ${symbol}`;
  } else {
    const fractionStr = fraction.toString().padStart(decimals, '0').replace(/0+$/, '');
    formatted = `${whole.toLocaleString()}.${fractionStr} ${symbol}`;
  }

  return { raw, formatted };
}
