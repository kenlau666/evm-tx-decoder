/**
 * Manual test script for protocol registry
 * Run with: npx tsx scripts/test-protocol-registry.ts
 */

import { getProtocol, listProtocols, getProtocolContracts } from '../src/services/protocol';
import type { Address, ChainId } from '../src/types';

const testCases = [
  {
    name: 'WETH on Ethereum',
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' as Address,
    chainId: 1 as ChainId,
    expectedProtocol: 'weth',
    expectedContract: 'WETH9',
  },
  {
    name: 'Uniswap V2 Router (lowercase)',
    address: '0x7a250d5630b4cf539739df2c5dacb4c659f2488d' as Address,
    chainId: 1 as ChainId,
    expectedProtocol: 'uniswap',
    expectedContract: 'Uniswap V2: Router 2',
  },
  {
    name: 'Uniswap V3 Router 2',
    address: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45' as Address,
    chainId: 1 as ChainId,
    expectedProtocol: 'uniswap',
    expectedContract: 'Uniswap V3: Router 2',
  },
  {
    name: 'SushiSwap Router',
    address: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F' as Address,
    chainId: 1 as ChainId,
    expectedProtocol: 'sushiswap',
    expectedContract: 'SushiSwap: Router',
  },
  {
    name: '1inch Aggregation Router',
    address: '0x1111111254EEB25477B68fb85Ed929f73A960582' as Address,
    chainId: 1 as ChainId,
    expectedProtocol: '1inch',
    expectedContract: '1inch V5: Aggregation Router',
  },
  {
    name: 'Unknown address',
    address: '0xDeadBeefDeadBeefDeadBeefDeadBeefDeadBeef' as Address,
    chainId: 1 as ChainId,
    expectedProtocol: null,
    expectedContract: null,
  },
  {
    name: 'Known address on unsupported chain',
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' as Address,
    chainId: 137 as ChainId, // Polygon
    expectedProtocol: null,
    expectedContract: null,
  },
];

console.log('=== Protocol Registry Tests ===\n');

let passed = 0;
let failed = 0;

for (const tc of testCases) {
  console.log(`Test: ${tc.name}`);
  console.log(`  Address: ${tc.address.slice(0, 10)}...`);
  console.log(`  ChainId: ${tc.chainId}`);

  const result = getProtocol(tc.address, tc.chainId);

  const protocolMatch = result?.protocol.id === tc.expectedProtocol ||
    (result === null && tc.expectedProtocol === null);
  const contractMatch = result?.contractName === tc.expectedContract ||
    (result === null && tc.expectedContract === null);

  console.log(`  Protocol: ${result?.protocol.id ?? 'null'} (expected: ${tc.expectedProtocol}) ${protocolMatch ? '✓' : '✗'}`);
  console.log(`  Contract: ${result?.contractName ?? 'null'} (expected: ${tc.expectedContract}) ${contractMatch ? '✓' : '✗'}`);

  if (protocolMatch && contractMatch) {
    passed++;
    console.log('  Result: PASS\n');
  } else {
    failed++;
    console.log('  Result: FAIL\n');
  }
}

// Test listProtocols
console.log('=== listProtocols Test ===');
const protocols = listProtocols(1);
console.log(`Found ${protocols.length} unique protocols on Ethereum:`);
protocols.forEach(p => console.log(`  - ${p.name} (${p.id})`));
const listProtocolsPass = protocols.length >= 5; // We defined 5 protocols
console.log(`Result: ${listProtocolsPass ? 'PASS' : 'FAIL'}\n`);
if (listProtocolsPass) passed++; else failed++;

// Test getProtocolContracts
console.log('=== getProtocolContracts Test ===');
const uniswapContracts = getProtocolContracts('uniswap', 1);
console.log(`Found ${uniswapContracts.length} Uniswap contracts on Ethereum:`);
uniswapContracts.forEach(c => console.log(`  - ${c.contractName}`));
const protocolContractsPass = uniswapContracts.length >= 4; // We defined 4 Uniswap contracts
console.log(`Result: ${protocolContractsPass ? 'PASS' : 'FAIL'}\n`);
if (protocolContractsPass) passed++; else failed++;

console.log('=== Summary ===');
console.log(`Passed: ${passed}/${passed + failed}`);
console.log(`Failed: ${failed}/${passed + failed}`);

process.exit(failed > 0 ? 1 : 0);
