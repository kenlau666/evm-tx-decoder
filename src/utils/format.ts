import type { TokenInfo } from '@/types';

const MAX_UINT256 = 2n ** 256n - 1n;

/**
 * Formats a token amount with proper decimals
 */
export function formatTokenAmount(
  amount: bigint,
  decimals: number,
  maxDecimals = 6
): string {
  if (amount === MAX_UINT256) {
    return 'Unlimited';
  }

  const divisor = 10n ** BigInt(decimals);
  const whole = amount / divisor;
  const remainder = amount % divisor;

  if (remainder === 0n) {
    return formatNumber(whole);
  }

  const remainderStr = remainder.toString().padStart(decimals, '0');
  const trimmed = remainderStr.slice(0, maxDecimals).replace(/0+$/, '');

  if (trimmed === '') {
    return formatNumber(whole);
  }

  return `${formatNumber(whole)}.${trimmed}`;
}

/**
 * Formats a number with thousand separators
 */
export function formatNumber(value: bigint | number): string {
  return value.toLocaleString('en-US');
}

/**
 * Formats a token amount with symbol
 */
export function formatWithSymbol(
  amount: bigint,
  token: TokenInfo
): string {
  const formatted = formatTokenAmount(amount, token.decimals);
  return `${formatted} ${token.symbol}`;
}

/**
 * Formats ETH value from wei
 */
export function formatEth(wei: bigint): string {
  return formatTokenAmount(wei, 18);
}
