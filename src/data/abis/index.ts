import { toFunctionSelector } from 'viem';
import type { Hex } from '@/types';
import { ERC20_ABI } from './erc20';
import { WETH_ABI } from './weth';
import { UNISWAP_V2_ROUTER_ABI } from './uniswap-v2-router';
import { UNISWAP_V3_ROUTER_ABI } from './uniswap-v3-router';

// Re-export ABIs
export { ERC20_ABI } from './erc20';
export { WETH_ABI } from './weth';
export { UNISWAP_V2_ROUTER_ABI } from './uniswap-v2-router';
export { UNISWAP_V3_ROUTER_ABI } from './uniswap-v3-router';

// All ABIs combined for indexing
const ALL_ABIS = [
  ...ERC20_ABI,
  ...WETH_ABI,
  ...UNISWAP_V2_ROUTER_ABI,
  ...UNISWAP_V3_ROUTER_ABI,
] as const;

export type AbiItem = (typeof ALL_ABIS)[number];

// Build selector index: maps 4-byte selector → ABI fragment
function buildSelectorIndex(): Map<Hex, readonly AbiItem[]> {
  const index = new Map<Hex, AbiItem[]>();

  for (const item of ALL_ABIS) {
    if (item.type === 'function') {
      const selector = toFunctionSelector(item) as Hex;
      const existing = index.get(selector) || [];
      existing.push(item);
      index.set(selector, existing);
    }
  }

  // Convert to readonly arrays
  const readonlyIndex = new Map<Hex, readonly AbiItem[]>();
  for (const [key, value] of index) {
    readonlyIndex.set(key, value);
  }

  return readonlyIndex;
}

export const SELECTOR_INDEX = buildSelectorIndex();
