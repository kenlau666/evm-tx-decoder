import type { Address, ChainId, TokenInfo } from '@/types';

const UNISWAP_TOKEN_LIST_URL =
  'https://tokens.uniswap.org';

const CACHE_KEY = 'tx-decoder-token-cache';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// MAX_UINT256 for detecting unlimited approvals
const MAX_UINT256 = 2n ** 256n - 1n;

interface TokenCache {
  tokens: Map<string, TokenInfo>;
  timestamp: number;
}

interface TokenListResponse {
  tokens: Array<{
    chainId: number;
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    logoURI?: string;
  }>;
}

// In-memory cache
let tokenCache: TokenCache | null = null;

/**
 * Generate cache key for a token
 */
function getCacheKey(address: Address, chainId: ChainId): string {
  return `${chainId}:${address.toLowerCase()}`;
}

/**
 * Load token cache from localStorage
 */
function loadCache(): TokenCache | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const parsed = JSON.parse(cached);
    if (Date.now() - parsed.timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    // Convert array back to Map
    const tokens = new Map<string, TokenInfo>(parsed.tokens);
    return { tokens, timestamp: parsed.timestamp };
  } catch {
    return null;
  }
}

/**
 * Save token cache to localStorage
 */
function saveCache(cache: TokenCache): void {
  try {
    const serializable = {
      tokens: Array.from(cache.tokens.entries()),
      timestamp: cache.timestamp,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(serializable));
  } catch {
    // localStorage might be full or unavailable
  }
}

/**
 * Fetch tokens from Uniswap Token List
 */
async function fetchTokenList(): Promise<Map<string, TokenInfo>> {
  const tokens = new Map<string, TokenInfo>();

  try {
    const response = await fetch(UNISWAP_TOKEN_LIST_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch token list: ${response.status}`);
    }

    const data: TokenListResponse = await response.json();

    for (const token of data.tokens) {
      // Only include supported chains
      const chainId = token.chainId as ChainId;
      if (![1, 10, 137, 42161, 8453, 43114, 56].includes(chainId)) {
        continue;
      }

      const tokenInfo: TokenInfo = {
        address: token.address.toLowerCase() as Address,
        chainId,
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        logoURI: token.logoURI,
      };

      const key = getCacheKey(tokenInfo.address, chainId);
      tokens.set(key, tokenInfo);
    }
  } catch (error) {
    console.error('Failed to fetch token list:', error);
  }

  return tokens;
}

/**
 * Initialize or refresh the token cache
 */
async function ensureCache(): Promise<TokenCache> {
  if (tokenCache) {
    return tokenCache;
  }

  // Try to load from localStorage
  const cached = loadCache();
  if (cached) {
    tokenCache = cached;
    return tokenCache;
  }

  // Fetch fresh data
  const tokens = await fetchTokenList();
  tokenCache = { tokens, timestamp: Date.now() };
  saveCache(tokenCache);

  return tokenCache;
}

/**
 * Get token info by address and chainId.
 * Returns null if token is not found.
 */
export async function getToken(
  address: Address,
  chainId: ChainId
): Promise<TokenInfo | null> {
  const cache = await ensureCache();
  const key = getCacheKey(address, chainId);
  return cache.tokens.get(key) ?? null;
}

/**
 * Get multiple tokens at once.
 */
export async function getTokens(
  addresses: Address[],
  chainId: ChainId
): Promise<Map<Address, TokenInfo>> {
  const cache = await ensureCache();
  const result = new Map<Address, TokenInfo>();

  for (const address of addresses) {
    const key = getCacheKey(address, chainId);
    const token = cache.tokens.get(key);
    if (token) {
      result.set(address.toLowerCase() as Address, token);
    }
  }

  return result;
}

/**
 * Format a token amount with proper decimals and symbol.
 * Shows "Unlimited" for MAX_UINT256 (common in approvals).
 */
export function formatAmount(amount: bigint, token: TokenInfo): string {
  // Check for unlimited approval
  if (amount === MAX_UINT256) {
    return `Unlimited ${token.symbol}`;
  }

  // Format with decimals
  const divisor = 10n ** BigInt(token.decimals);
  const wholePart = amount / divisor;
  const fractionalPart = amount % divisor;

  // Format fractional part with proper padding
  let fractionalStr = fractionalPart.toString().padStart(token.decimals, '0');
  // Trim trailing zeros but keep at least 2 decimal places for readability
  fractionalStr = fractionalStr.replace(/0+$/, '');
  if (fractionalStr.length < 2 && fractionalStr.length > 0) {
    fractionalStr = fractionalStr.padEnd(2, '0');
  }

  if (fractionalStr) {
    return `${wholePart.toLocaleString()}.${fractionalStr} ${token.symbol}`;
  }

  return `${wholePart.toLocaleString()} ${token.symbol}`;
}

/**
 * Check if an address is a known token.
 */
export async function isToken(
  address: Address,
  chainId: ChainId
): Promise<boolean> {
  const token = await getToken(address, chainId);
  return token !== null;
}

/**
 * Clear the token cache (useful for testing or forced refresh)
 */
export function clearCache(): void {
  tokenCache = null;
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // Ignore errors
  }
}
