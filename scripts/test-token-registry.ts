/**
 * Manual test script for token registry
 * Run with: npx tsx scripts/test-token-registry.ts
 */

import { formatAmount } from '../src/services/token';
import type { TokenInfo, Address, ChainId } from '../src/types';

// Mock token for testing formatAmount
const mockUSDC: TokenInfo = {
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' as Address,
  chainId: 1 as ChainId,
  symbol: 'USDC',
  name: 'USD Coin',
  decimals: 6,
};

const mockWETH: TokenInfo = {
  address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' as Address,
  chainId: 1 as ChainId,
  symbol: 'WETH',
  name: 'Wrapped Ether',
  decimals: 18,
};

const MAX_UINT256 = 2n ** 256n - 1n;

const formatTestCases = [
  {
    name: 'USDC: 1,000,000 (1 USDC)',
    amount: 1_000_000n,
    token: mockUSDC,
    expected: '1 USDC',
  },
  {
    name: 'USDC: 1,500,000 (1.5 USDC)',
    amount: 1_500_000n,
    token: mockUSDC,
    expected: '1.50 USDC',
  },
  {
    name: 'USDC: 123,456 (0.123456 USDC)',
    amount: 123_456n,
    token: mockUSDC,
    expected: '0.123456 USDC',
  },
  {
    name: 'WETH: 1 ETH',
    amount: 1_000_000_000_000_000_000n,
    token: mockWETH,
    expected: '1 WETH',
  },
  {
    name: 'WETH: 0.5 ETH',
    amount: 500_000_000_000_000_000n,
    token: mockWETH,
    expected: '0.50 WETH',
  },
  {
    name: 'WETH: 1.234 ETH',
    amount: 1_234_000_000_000_000_000n,
    token: mockWETH,
    expected: '1.234 WETH',
  },
  {
    name: 'MAX_UINT256 shows Unlimited',
    amount: MAX_UINT256,
    token: mockUSDC,
    expected: 'Unlimited USDC',
  },
  {
    name: 'Zero amount',
    amount: 0n,
    token: mockWETH,
    expected: '0 WETH',
  },
];

console.log('=== Token Registry Tests ===\n');
console.log('--- formatAmount Tests ---\n');

let passed = 0;
let failed = 0;

for (const tc of formatTestCases) {
  const result = formatAmount(tc.amount, tc.token);
  const match = result === tc.expected;

  console.log(`Test: ${tc.name}`);
  console.log(`  Result: "${result}"`);
  console.log(`  Expected: "${tc.expected}"`);
  console.log(`  Status: ${match ? 'PASS ✓' : 'FAIL ✗'}\n`);

  if (match) passed++;
  else failed++;
}

console.log('=== Summary ===');
console.log(`Passed: ${passed}/${passed + failed}`);
console.log(`Failed: ${failed}/${passed + failed}`);

// Note about async tests
console.log('\n--- Notes ---');
console.log('getToken() and isToken() require network access to test.');
console.log('They fetch from Uniswap Token List API and cache in localStorage.');

process.exit(failed > 0 ? 1 : 0);
