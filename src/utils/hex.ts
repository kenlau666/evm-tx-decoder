import type { Hex } from '@/types';

/**
 * Validates that a string is valid hex format
 */
export function isValidHex(value: string): value is Hex {
  if (!value.startsWith('0x')) {
    return false;
  }
  const hexPart = value.slice(2);
  return /^[0-9a-fA-F]*$/.test(hexPart);
}

/**
 * Validates hex and returns error message if invalid
 */
export function validateHex(value: string): string | null {
  if (!value) {
    return 'Input is required';
  }
  if (!value.startsWith('0x')) {
    return 'Invalid hex: must start with 0x';
  }
  const hexPart = value.slice(2);
  if (!/^[0-9a-fA-F]*$/.test(hexPart)) {
    return 'Invalid hex: contains non-hex characters';
  }
  if (hexPart.length < 8) {
    return 'Invalid calldata: minimum 4 bytes required';
  }
  return null;
}

/**
 * Extracts the 4-byte function selector from calldata
 */
export function extractSelector(data: Hex): Hex {
  return data.slice(0, 10) as Hex;
}

/**
 * Shortens an address for display
 */
export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}
