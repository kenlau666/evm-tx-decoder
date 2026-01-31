/**
 * Manual test script for summary generator
 * Run with: npx tsx scripts/test-summary-generator.ts
 */

import { generateSummary } from '../src/services/decoder/summary-generator';
import { getActionMapping, getActionByFunctionName } from '../src/data/action-mappings';
import type { DecodedFunctionCall, Hex } from '../src/types';

// Mock decoded function calls
const mockTransfer: DecodedFunctionCall = {
  name: 'transfer',
  signature: 'transfer(address,uint256)',
  selector: '0xa9059cbb' as Hex,
  args: [
    { name: 'to', type: 'address', value: '0x1234567890123456789012345678901234567890', formatted: '0x1234567890123456789012345678901234567890' },
    { name: 'amount', type: 'uint256', value: 1000000n, formatted: '1000000' },
  ],
  abi: [],
};

const mockApprove: DecodedFunctionCall = {
  name: 'approve',
  signature: 'approve(address,uint256)',
  selector: '0x095ea7b3' as Hex,
  args: [
    { name: 'spender', type: 'address', value: '0xabcdef0123456789abcdef0123456789abcdef01', formatted: '0xabcdef0123456789abcdef0123456789abcdef01' },
    { name: 'amount', type: 'uint256', value: 115792089237316195423570985008687907853269984665640564039457584007913129639935n, formatted: 'Unlimited' },
  ],
  abi: [],
};

const mockDeposit: DecodedFunctionCall = {
  name: 'deposit',
  signature: 'deposit()',
  selector: '0xd0e30db0' as Hex,
  args: [],
  abi: [],
};

const mockWithdraw: DecodedFunctionCall = {
  name: 'withdraw',
  signature: 'withdraw(uint256)',
  selector: '0x2e1a7d4d' as Hex,
  args: [
    { name: 'amount', type: 'uint256', value: 1000000000000000000n, formatted: '1000000000000000000' },
  ],
  abi: [],
};

const mockUnknownFunction: DecodedFunctionCall = {
  name: 'customFunction',
  signature: 'customFunction(uint256)',
  selector: '0xdeadbeef' as Hex,
  args: [
    { name: 'value', type: 'uint256', value: 100n, formatted: '100' },
  ],
  abi: [],
};

console.log('=== Summary Generator Tests ===\n');

let passed = 0;
let failed = 0;

// Test 1: ERC20 Transfer
console.log('Test 1: ERC20 Transfer');
const transferSummary = generateSummary(mockTransfer);
console.log(`  Title: "${transferSummary.title}"`);
console.log(`  Action: ${transferSummary.action}`);
const test1Pass = transferSummary.action === 'transfer' && transferSummary.title.includes('Transfer');
console.log(`  Result: ${test1Pass ? 'PASS ✓' : 'FAIL ✗'}\n`);
if (test1Pass) passed++; else failed++;

// Test 2: ERC20 Approve
console.log('Test 2: ERC20 Approve');
const approveSummary = generateSummary(mockApprove);
console.log(`  Title: "${approveSummary.title}"`);
console.log(`  Action: ${approveSummary.action}`);
const test2Pass = approveSummary.action === 'approve' && approveSummary.title.includes('Approve');
console.log(`  Result: ${test2Pass ? 'PASS ✓' : 'FAIL ✗'}\n`);
if (test2Pass) passed++; else failed++;

// Test 3: WETH Wrap (deposit)
console.log('Test 3: WETH Wrap (deposit)');
const depositSummary = generateSummary(mockDeposit, 1000000000000000000n);
console.log(`  Title: "${depositSummary.title}"`);
console.log(`  Action: ${depositSummary.action}`);
console.log(`  ETH Value: ${depositSummary.ethValue}`);
const test3Pass = depositSummary.action === 'wrap' && depositSummary.title.includes('Wrap');
console.log(`  Result: ${test3Pass ? 'PASS ✓' : 'FAIL ✗'}\n`);
if (test3Pass) passed++; else failed++;

// Test 4: WETH Unwrap (withdraw)
console.log('Test 4: WETH Unwrap (withdraw)');
const withdrawSummary = generateSummary(mockWithdraw);
console.log(`  Title: "${withdrawSummary.title}"`);
console.log(`  Action: ${withdrawSummary.action}`);
const test4Pass = withdrawSummary.action === 'unwrap' && withdrawSummary.title.includes('Unwrap');
console.log(`  Result: ${test4Pass ? 'PASS ✓' : 'FAIL ✗'}\n`);
if (test4Pass) passed++; else failed++;

// Test 5: Unknown function (fallback)
console.log('Test 5: Unknown function (fallback)');
const unknownSummary = generateSummary(mockUnknownFunction);
console.log(`  Title: "${unknownSummary.title}"`);
console.log(`  Action: ${unknownSummary.action}`);
const test5Pass = unknownSummary.action === 'unknown' && unknownSummary.title === 'Custom Function';
console.log(`  Result: ${test5Pass ? 'PASS ✓' : 'FAIL ✗'}\n`);
if (test5Pass) passed++; else failed++;

// Test 6: Null function call
console.log('Test 6: Null function call (ETH transfer)');
const nullSummary = generateSummary(null, 5000000000000000000n);
console.log(`  Title: "${nullSummary.title}"`);
console.log(`  Action: ${nullSummary.action}`);
const test6Pass = nullSummary.action === 'unknown' && nullSummary.title.includes('Send') && nullSummary.title.includes('ETH');
console.log(`  Result: ${test6Pass ? 'PASS ✓' : 'FAIL ✗'}\n`);
if (test6Pass) passed++; else failed++;

// Test 7: Action mappings lookup
console.log('Test 7: Action mapping lookups');
const mapping1 = getActionMapping('0xa9059cbb');
const mapping2 = getActionMapping('0xd0e30db0');
const mapping3 = getActionMapping('0xdeadbeef');
console.log(`  transfer selector: ${mapping1?.action ?? 'null'}`);
console.log(`  deposit selector: ${mapping2?.action ?? 'null'}`);
console.log(`  unknown selector: ${mapping3?.action ?? 'null'}`);
const test7Pass = mapping1?.action === 'transfer' && mapping2?.action === 'wrap' && mapping3 === null;
console.log(`  Result: ${test7Pass ? 'PASS ✓' : 'FAIL ✗'}\n`);
if (test7Pass) passed++; else failed++;

// Test 8: Fallback action by function name
console.log('Test 8: Fallback action by function name');
const swapAction = getActionByFunctionName('swapExactTokensForTokens');
const stakeAction = getActionByFunctionName('stakeTokens');
const depositAction = getActionByFunctionName('depositFunds');
const unknownAction = getActionByFunctionName('doSomething');
console.log(`  swapExactTokensForTokens: ${swapAction}`);
console.log(`  stakeTokens: ${stakeAction}`);
console.log(`  depositFunds: ${depositAction}`);
console.log(`  doSomething: ${unknownAction}`);
const test8Pass = swapAction === 'swap' && stakeAction === 'stake' && depositAction === 'deposit' && unknownAction === 'unknown';
console.log(`  Result: ${test8Pass ? 'PASS ✓' : 'FAIL ✗'}\n`);
if (test8Pass) passed++; else failed++;

console.log('=== Summary ===');
console.log(`Passed: ${passed}/${passed + failed}`);
console.log(`Failed: ${failed}/${passed + failed}`);

process.exit(failed > 0 ? 1 : 0);
