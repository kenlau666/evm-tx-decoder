/**
 * Manual test script for calldata decoder
 * Run with: npx tsx scripts/test-calldata-decoder.ts
 */

import { decodeCalldata, extractSelector } from '../src/services/decoder/calldata-decoder';

// Test data - known function calls
const testCases = [
  {
    name: 'ERC20 transfer',
    // transfer(address,uint256) with to=0x1234...5678, amount=1000000
    data: '0xa9059cbb0000000000000000000000001234567890123456789012345678901234567890000000000000000000000000000000000000000000000000000000000000000f4240',
    expectedSelector: '0xa9059cbb',
    expectedFunction: 'transfer',
  },
  {
    name: 'ERC20 approve',
    // approve(address,uint256) with spender=0xabcd...ef01, amount=max
    data: '0x095ea7b3000000000000000000000000abcdef0123456789abcdef0123456789abcdef01ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
    expectedSelector: '0x095ea7b3',
    expectedFunction: 'approve',
  },
  {
    name: 'WETH deposit',
    // deposit() - no args
    data: '0xd0e30db0',
    expectedSelector: '0xd0e30db0',
    expectedFunction: 'deposit',
  },
  {
    name: 'Unknown selector',
    data: '0xdeadbeef0000000000000000000000000000000000000000000000000000000000000001',
    expectedSelector: '0xdeadbeef',
    expectedFunction: null,
  },
  {
    name: 'Too short calldata',
    data: '0xa905',
    expectedSelector: null,
    expectedFunction: null,
  },
  {
    name: 'ERC20 transferFrom',
    // transferFrom(address,address,uint256)
    data: '0x23b872dd000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa000000000000000000000000bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb0000000000000000000000000000000000000000000000000000000000000064',
    expectedSelector: '0x23b872dd',
    expectedFunction: 'transferFrom',
  },
  {
    name: 'WETH withdraw',
    // withdraw(uint256)
    data: '0x2e1a7d4d0000000000000000000000000000000000000000000000000de0b6b3a7640000',
    expectedSelector: '0x2e1a7d4d',
    expectedFunction: 'withdraw',
  },
];

console.log('=== Calldata Decoder Tests ===\n');

let passed = 0;
let failed = 0;

for (const tc of testCases) {
  console.log(`Test: ${tc.name}`);
  console.log(`  Input: ${tc.data.slice(0, 20)}...`);

  const selector = extractSelector(tc.data as `0x${string}`);
  const selectorMatch = selector === tc.expectedSelector;

  console.log(`  Selector: ${selector} (expected: ${tc.expectedSelector}) ${selectorMatch ? '✓' : '✗'}`);

  const decoded = decodeCalldata(tc.data as `0x${string}`);
  const functionMatch = decoded?.name === tc.expectedFunction || (decoded === null && tc.expectedFunction === null);

  console.log(`  Function: ${decoded?.name ?? 'null'} (expected: ${tc.expectedFunction}) ${functionMatch ? '✓' : '✗'}`);

  if (decoded) {
    console.log(`  Signature: ${decoded.signature}`);
    console.log(`  Args: ${decoded.args.map(a => `${a.name}=${a.formatted}`).join(', ')}`);
  }

  if (selectorMatch && functionMatch) {
    passed++;
    console.log('  Result: PASS\n');
  } else {
    failed++;
    console.log('  Result: FAIL\n');
  }
}

console.log('=== Summary ===');
console.log(`Passed: ${passed}/${testCases.length}`);
console.log(`Failed: ${failed}/${testCases.length}`);

process.exit(failed > 0 ? 1 : 0);
