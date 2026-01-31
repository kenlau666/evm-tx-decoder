// ============================================
// TX DECODER - SHARED TYPES
// Version: 1.0
// ============================================

// --------------------------------------------
// Common Types
// --------------------------------------------

export type Address = `0x${string}`;
export type Hex = `0x${string}`;

export type ChainId = 1 | 10 | 137 | 42161 | 8453 | 43114 | 56;

// --------------------------------------------
// Transaction Types
// --------------------------------------------

export interface RawTransactionInput {
  hex: Hex;
  toAddress?: Address;
  chainId?: ChainId;
}

export interface ParsedTransaction {
  to: Address | null;
  value: bigint;
  data: Hex;
  chainId: ChainId | null;
  txType: 'legacy' | 'eip1559' | 'eip2930' | 'calldata-only';
  gas?: {
    limit: bigint;
    maxFeePerGas?: bigint;
    maxPriorityFeePerGas?: bigint;
    gasPrice?: bigint;
  };
  from?: Address;
  nonce?: number;
}

export interface DecodedFunctionCall {
  name: string;
  signature: string;
  selector: Hex;
  args: DecodedArgument[];
  abi: readonly unknown[];
}

export interface DecodedArgument {
  name: string;
  type: string;
  value: unknown;
  formatted: string;
  tokenInfo?: TokenInfo;
}

// --------------------------------------------
// Token Types
// --------------------------------------------

export interface TokenInfo {
  address: Address;
  chainId: ChainId;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

export interface TokenAmount {
  token: TokenInfo;
  raw: bigint;
  formatted: string;
  usdValue?: string;
}

// --------------------------------------------
// Protocol Types
// --------------------------------------------

export interface ProtocolInfo {
  id: string;
  name: string;
  logoURI?: string;
  website?: string;
}

export interface ContractLabel {
  address: Address;
  chainId: ChainId;
  protocol: ProtocolInfo;
  contractName: string;
}

// --------------------------------------------
// Decoder Output Types
// --------------------------------------------

export interface DecodedTransaction {
  parsed: ParsedTransaction;
  functionCall: DecodedFunctionCall | null;
  protocol: ProtocolInfo | null;
  contractLabel: ContractLabel | null;
  summary: TransactionSummary;
  status: DecodeStatus;
}

export interface TransactionSummary {
  title: string;
  action: TransactionAction;
  tokensIn: TokenAmount[];
  tokensOut: TokenAmount[];
  ethValue?: string;
  details: Record<string, string>;
}

export type TransactionAction =
  | 'swap'
  | 'transfer'
  | 'approve'
  | 'add-liquidity'
  | 'remove-liquidity'
  | 'stake'
  | 'unstake'
  | 'borrow'
  | 'repay'
  | 'deposit'
  | 'withdraw'
  | 'mint'
  | 'burn'
  | 'bridge'
  | 'wrap'
  | 'unwrap'
  | 'unknown';

export type DecodeStatus =
  | { type: 'success' }
  | { type: 'partial'; message: string }
  | { type: 'unknown-function'; selector: Hex }
  | { type: 'unknown-protocol' }
  | { type: 'invalid-input'; message: string };

// --------------------------------------------
// Error Types
// --------------------------------------------

export type DecodeErrorCode =
  | 'INVALID_HEX'
  | 'INVALID_TX_FORMAT'
  | 'UNKNOWN_SELECTOR'
  | 'ABI_DECODE_FAILED'
  | 'TOKEN_NOT_FOUND'
  | 'NETWORK_ERROR'
  | 'UNSUPPORTED_CHAIN';

// --------------------------------------------
// App State Types
// --------------------------------------------

export interface AppState {
  input: RawTransactionInput | null;
  result: DecodedTransaction | null;
  isLoading: boolean;
  error: string | null;
  selectedChain: ChainId;
  preferences: {
    showRawData: boolean;
    expandArgs: boolean;
  };
}

export type AppAction =
  | { type: 'SET_INPUT'; payload: RawTransactionInput }
  | { type: 'DECODE_START' }
  | { type: 'DECODE_SUCCESS'; payload: DecodedTransaction }
  | { type: 'DECODE_ERROR'; payload: string }
  | { type: 'SET_CHAIN'; payload: ChainId }
  | { type: 'TOGGLE_RAW_DATA' }
  | { type: 'TOGGLE_EXPAND_ARGS' }
  | { type: 'RESET' };

// --------------------------------------------
// Chain Types
// --------------------------------------------

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
  tokenListUrl?: string;
}
