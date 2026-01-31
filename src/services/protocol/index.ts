import type { Address, ChainId, ContractLabel, ProtocolInfo } from '@/types';
import { getContract, getContractsByChain } from '@/data/contracts';

/**
 * Get protocol information for a contract address.
 * Returns ContractLabel with protocol info, or null if unknown.
 */
export function getProtocol(
  address: Address,
  chainId: ChainId
): ContractLabel | null {
  return getContract(address, chainId);
}

/**
 * Get all unique protocols for a chain.
 */
export function listProtocols(chainId: ChainId): ProtocolInfo[] {
  const contracts = getContractsByChain(chainId);
  const seen = new Set<string>();
  const protocols: ProtocolInfo[] = [];

  for (const contract of contracts) {
    if (!seen.has(contract.protocol.id)) {
      seen.add(contract.protocol.id);
      protocols.push(contract.protocol);
    }
  }

  return protocols;
}

/**
 * Get all contracts for a specific protocol on a chain.
 */
export function getProtocolContracts(
  protocolId: string,
  chainId: ChainId
): ContractLabel[] {
  const contracts = getContractsByChain(chainId);
  return contracts.filter((c) => c.protocol.id === protocolId);
}
