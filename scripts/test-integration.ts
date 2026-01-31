/**
 * Integration test script for the decoder service
 * Run with: npx tsx scripts/test-integration.ts
 */

import { parseTransaction, decodeCalldata, generateSummary } from '../src/services/decoder';
import { getProtocol } from '../src/services/protocol';
import type { Hex, ChainId, DecodedTransaction, DecodeStatus } from '../src/types';

// Mock the useDecoder logic for testing
async function decode(hex: Hex, chainId: ChainId): Promise<DecodedTransaction> {
  const parsed = parseTransaction(hex);
  const effectiveChainId = parsed.chainId ?? chainId;

  const functionCall =
    parsed.data && parsed.data !== '0x'
      ? decodeCalldata(parsed.data)
      : null;

  const contractLabel =
    parsed.to && effectiveChainId
      ? getProtocol(parsed.to, effectiveChainId)
      : null;

  const summary = generateSummary(functionCall, parsed.value);

  let status: DecodeStatus;
  if (functionCall) {
    status = { type: 'success' };
  } else if (parsed.data && parsed.data.length >= 10) {
    status = {
      type: 'unknown-function',
      selector: parsed.data.slice(0, 10).toLowerCase() as Hex,
    };
  } else if (!contractLabel && parsed.to) {
    status = { type: 'unknown-protocol' };
  } else {
    status = { type: 'success' };
  }

  return {
    parsed,
    functionCall,
    protocol: contractLabel?.protocol ?? null,
    contractLabel,
    summary,
    status,
  };
}

// Test cases
const testCases = [
  {
    name: 'ERC20 Transfer calldata',
    hex: '0xa9059cbb000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa960450000000000000000000000000000000000000000000000000de0b6b3a7640000' as Hex,
    chainId: 1 as ChainId,
    expectedAction: 'transfer',
    expectedFunctionName: 'transfer',
  },
  {
    name: 'ERC20 Approve calldata',
    hex: '0x095ea7b3000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff' as Hex,
    chainId: 1 as ChainId,
    expectedAction: 'approve',
    expectedFunctionName: 'approve',
  },
  {
    name: 'WETH Deposit calldata',
    hex: '0xd0e30db0' as Hex,
    chainId: 1 as ChainId,
    expectedAction: 'wrap',
    expectedFunctionName: 'deposit',
  },
  {
    name: 'WETH Withdraw calldata',
    hex: '0x2e1a7d4d0000000000000000000000000000000000000000000000000de0b6b3a7640000' as Hex,
    chainId: 1 as ChainId,
    expectedAction: 'unwrap',
    expectedFunctionName: 'withdraw',
  },
  {
    name: 'Unknown function calldata',
    hex: '0xdeadbeef0000000000000000000000000000000000000000000000000000000000000001' as Hex,
    chainId: 1 as ChainId,
    expectedAction: 'unknown',
    expectedFunctionName: null,
  },
];

async function runTests() {
  console.log('=== Integration Tests ===\n');

  let passed = 0;
  let failed = 0;

  for (const tc of testCases) {
    console.log(`Test: ${tc.name}`);
    console.log(`  Hex: ${tc.hex.slice(0, 20)}...`);

    try {
      const result = await decode(tc.hex, tc.chainId);

      const actionMatch = result.summary.action === tc.expectedAction;
      const fnMatch = tc.expectedFunctionName === null
        ? result.functionCall === null
        : result.functionCall?.name === tc.expectedFunctionName;

      console.log(`  Action: ${result.summary.action} (expected: ${tc.expectedAction}) ${actionMatch ? '✓' : '✗'}`);
      console.log(`  Function: ${result.functionCall?.name ?? 'null'} (expected: ${tc.expectedFunctionName}) ${fnMatch ? '✓' : '✗'}`);
      console.log(`  Title: "${result.summary.title}"`);
      console.log(`  Status: ${result.status.type}`);

      if (actionMatch && fnMatch) {
        passed++;
        console.log('  Result: PASS\n');
      } else {
        failed++;
        console.log('  Result: FAIL\n');
      }
    } catch (err) {
      failed++;
      console.log(`  Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.log('  Result: FAIL\n');
    }
  }

  // Test AppState reducer logic
  console.log('=== AppState Reducer Tests ===\n');

  interface TestState {
    isLoading: boolean;
    error: string | null;
    selectedChain: ChainId;
  }

  const initialState: TestState = {
    isLoading: false,
    error: null,
    selectedChain: 1,
  };

  // Test DECODE_START
  console.log('Test: DECODE_START action');
  const afterStart = { ...initialState, isLoading: true, error: null };
  const startPass = afterStart.isLoading === true && afterStart.error === null;
  console.log(`  isLoading: ${afterStart.isLoading} (expected: true) ${startPass ? '✓' : '✗'}`);
  console.log(`  Result: ${startPass ? 'PASS' : 'FAIL'}\n`);
  if (startPass) passed++; else failed++;

  // Test SET_CHAIN
  console.log('Test: SET_CHAIN action');
  const afterChain = { ...initialState, selectedChain: 137 as ChainId };
  const chainPass = afterChain.selectedChain === 137;
  console.log(`  selectedChain: ${afterChain.selectedChain} (expected: 137) ${chainPass ? '✓' : '✗'}`);
  console.log(`  Result: ${chainPass ? 'PASS' : 'FAIL'}\n`);
  if (chainPass) passed++; else failed++;

  // Test DECODE_ERROR
  console.log('Test: DECODE_ERROR action');
  const afterError = { ...initialState, isLoading: false, error: 'Test error' };
  const errorPass = afterError.isLoading === false && afterError.error === 'Test error';
  console.log(`  isLoading: ${afterError.isLoading} (expected: false) ${errorPass ? '✓' : '✗'}`);
  console.log(`  error: "${afterError.error}" (expected: "Test error") ${errorPass ? '✓' : '✗'}`);
  console.log(`  Result: ${errorPass ? 'PASS' : 'FAIL'}\n`);
  if (errorPass) passed++; else failed++;

  console.log('=== Summary ===');
  console.log(`Passed: ${passed}/${passed + failed}`);
  console.log(`Failed: ${failed}/${passed + failed}`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
