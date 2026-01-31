import type { TransactionAction } from '@/types';

export interface ActionMapping {
  selector: string;
  functionName: string;
  action: TransactionAction;
  template: string;
}

// Maps function names to action types and summary templates
// Templates use placeholders: {to}, {amount}, {token}, {spender}
export const ACTION_MAPPINGS: ActionMapping[] = [
  // ERC20 Transfer
  {
    selector: '0xa9059cbb',
    functionName: 'transfer',
    action: 'transfer',
    template: 'Transfer {amount} to {to}',
  },
  // ERC20 TransferFrom
  {
    selector: '0x23b872dd',
    functionName: 'transferFrom',
    action: 'transfer',
    template: 'Transfer {amount} from {from} to {to}',
  },
  // ERC20 Approve
  {
    selector: '0x095ea7b3',
    functionName: 'approve',
    action: 'approve',
    template: 'Approve {spender} to spend {amount}',
  },
  // WETH Deposit (wrap)
  {
    selector: '0xd0e30db0',
    functionName: 'deposit',
    action: 'wrap',
    template: 'Wrap ETH to WETH',
  },
  // WETH Withdraw (unwrap)
  {
    selector: '0x2e1a7d4d',
    functionName: 'withdraw',
    action: 'unwrap',
    template: 'Unwrap {amount} WETH to ETH',
  },
  // Uniswap V2 swapExactTokensForTokens
  {
    selector: '0x38ed1739',
    functionName: 'swapExactTokensForTokens',
    action: 'swap',
    template: 'Swap {amountIn} for at least {amountOutMin}',
  },
  // Uniswap V2 swapTokensForExactTokens
  {
    selector: '0x8803dbee',
    functionName: 'swapTokensForExactTokens',
    action: 'swap',
    template: 'Swap up to {amountInMax} for {amountOut}',
  },
  // Uniswap V2 swapExactETHForTokens
  {
    selector: '0x7ff36ab5',
    functionName: 'swapExactETHForTokens',
    action: 'swap',
    template: 'Swap ETH for at least {amountOutMin} tokens',
  },
  // Uniswap V2 swapExactTokensForETH
  {
    selector: '0x18cbafe5',
    functionName: 'swapExactTokensForETH',
    action: 'swap',
    template: 'Swap {amountIn} tokens for at least {amountOutMin} ETH',
  },
  // Uniswap V2 addLiquidity
  {
    selector: '0xe8e33700',
    functionName: 'addLiquidity',
    action: 'add-liquidity',
    template: 'Add liquidity: {amountADesired} + {amountBDesired}',
  },
  // Uniswap V2 removeLiquidity
  {
    selector: '0xbaa2abde',
    functionName: 'removeLiquidity',
    action: 'remove-liquidity',
    template: 'Remove {liquidity} liquidity',
  },
  // Uniswap V3 exactInputSingle
  {
    selector: '0x414bf389',
    functionName: 'exactInputSingle',
    action: 'swap',
    template: 'Swap {amountIn} for at least {amountOutMinimum}',
  },
  // Uniswap V3 exactInput
  {
    selector: '0xc04b8d59',
    functionName: 'exactInput',
    action: 'swap',
    template: 'Swap {amountIn} via multi-hop for at least {amountOutMinimum}',
  },
  // Uniswap V3 exactOutputSingle
  {
    selector: '0xdb3e2198',
    functionName: 'exactOutputSingle',
    action: 'swap',
    template: 'Swap up to {amountInMaximum} for exactly {amountOut}',
  },
  // Uniswap V3 exactOutput
  {
    selector: '0xf28c0498',
    functionName: 'exactOutput',
    action: 'swap',
    template: 'Swap up to {amountInMaximum} via multi-hop for exactly {amountOut}',
  },
];

// Build selector index for quick lookup
const SELECTOR_TO_ACTION = new Map<string, ActionMapping>();
for (const mapping of ACTION_MAPPINGS) {
  SELECTOR_TO_ACTION.set(mapping.selector.toLowerCase(), mapping);
}

/**
 * Get action mapping by function selector.
 */
export function getActionMapping(selector: string): ActionMapping | null {
  return SELECTOR_TO_ACTION.get(selector.toLowerCase()) ?? null;
}

/**
 * Get action type by function name (fallback).
 */
export function getActionByFunctionName(
  functionName: string
): TransactionAction {
  const name = functionName.toLowerCase();

  if (name.includes('swap')) return 'swap';
  if (name.includes('transfer')) return 'transfer';
  if (name.includes('approve')) return 'approve';
  if (name.includes('stake') && !name.includes('unstake')) return 'stake';
  if (name.includes('unstake')) return 'unstake';
  if (name.includes('wrap') && !name.includes('unwrap')) return 'wrap';
  if (name.includes('unwrap')) return 'unwrap';
  if (name.includes('deposit')) return 'deposit';
  if (name.includes('withdraw')) return 'withdraw';
  if (name.includes('addliquidity')) return 'add-liquidity';
  if (name.includes('removeliquidity')) return 'remove-liquidity';
  if (name.includes('borrow')) return 'borrow';
  if (name.includes('repay')) return 'repay';
  if (name.includes('mint')) return 'mint';
  if (name.includes('burn')) return 'burn';
  if (name.includes('bridge')) return 'bridge';

  return 'unknown';
}
