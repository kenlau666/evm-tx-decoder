import type { Hex } from '@/types';
import { SELECTOR_INDEX, type AbiItem } from '@/data/abis';

/**
 * Get ABI fragments by 4-byte function selector.
 * Returns an array of matching ABI items (may have multiple matches for same selector).
 */
export function getBySelector(selector: Hex): readonly AbiItem[] {
  // Normalize selector to lowercase
  const normalizedSelector = selector.toLowerCase() as Hex;
  return SELECTOR_INDEX.get(normalizedSelector) ?? [];
}

/**
 * Check if a selector exists in the registry.
 */
export function hasSelector(selector: Hex): boolean {
  const normalizedSelector = selector.toLowerCase() as Hex;
  return SELECTOR_INDEX.has(normalizedSelector);
}

/**
 * Get all registered selectors.
 */
export function getAllSelectors(): Hex[] {
  return Array.from(SELECTOR_INDEX.keys());
}
