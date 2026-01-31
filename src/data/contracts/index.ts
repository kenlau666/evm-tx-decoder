import type { Address, ChainId, ContractLabel } from '@/types';
import { ETHEREUM_CONTRACTS } from './ethereum';

export { ETHEREUM_CONTRACTS } from './ethereum';

// Combined registry of all contracts by chainId
const CONTRACT_REGISTRY: Map<ChainId, Map<Address, ContractLabel>> = new Map();

// Build index for Ethereum mainnet
function buildIndex(contracts: ContractLabel[]): Map<Address, ContractLabel> {
  const index = new Map<Address, ContractLabel>();
  for (const contract of contracts) {
    // Normalize address to lowercase for case-insensitive lookup
    const normalizedAddress = contract.address.toLowerCase() as Address;
    index.set(normalizedAddress, contract);
  }
  return index;
}

CONTRACT_REGISTRY.set(1, buildIndex(ETHEREUM_CONTRACTS));

/**
 * Look up a contract by address and chainId.
 */
export function getContract(
  address: Address,
  chainId: ChainId
): ContractLabel | null {
  const chainContracts = CONTRACT_REGISTRY.get(chainId);
  if (!chainContracts) {
    return null;
  }
  const normalizedAddress = address.toLowerCase() as Address;
  return chainContracts.get(normalizedAddress) ?? null;
}

/**
 * Check if an address is a known contract.
 */
export function isKnownContract(address: Address, chainId: ChainId): boolean {
  return getContract(address, chainId) !== null;
}

/**
 * Get all contracts for a chain.
 */
export function getContractsByChain(chainId: ChainId): ContractLabel[] {
  const chainContracts = CONTRACT_REGISTRY.get(chainId);
  if (!chainContracts) {
    return [];
  }
  return Array.from(chainContracts.values());
}
