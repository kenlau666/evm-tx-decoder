import type { ChainId } from '@/types';

export interface ChainConfig {
  id: ChainId;
  name: string;
  shortName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorer: string;
}

export const CHAINS: Record<ChainId, ChainConfig> = {
  1: {
    id: 1,
    name: 'Ethereum',
    shortName: 'ETH',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    blockExplorer: 'https://etherscan.io',
  },
  10: {
    id: 10,
    name: 'Optimism',
    shortName: 'OP',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    blockExplorer: 'https://optimistic.etherscan.io',
  },
  137: {
    id: 137,
    name: 'Polygon',
    shortName: 'MATIC',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    blockExplorer: 'https://polygonscan.com',
  },
  42161: {
    id: 42161,
    name: 'Arbitrum One',
    shortName: 'ARB',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    blockExplorer: 'https://arbiscan.io',
  },
  8453: {
    id: 8453,
    name: 'Base',
    shortName: 'BASE',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    blockExplorer: 'https://basescan.org',
  },
  43114: {
    id: 43114,
    name: 'Avalanche',
    shortName: 'AVAX',
    nativeCurrency: { name: 'Avalanche', symbol: 'AVAX', decimals: 18 },
    blockExplorer: 'https://snowtrace.io',
  },
  56: {
    id: 56,
    name: 'BNB Smart Chain',
    shortName: 'BSC',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    blockExplorer: 'https://bscscan.com',
  },
};

export const SUPPORTED_CHAIN_IDS = Object.keys(CHAINS).map(Number) as ChainId[];
export const DEFAULT_CHAIN_ID: ChainId = 1;
