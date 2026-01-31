# TX Decoder - API Contracts

Version: 1.0
Last Updated: 2025-01-25

Since this is a frontend-only application, these contracts define the internal service interfaces. They enable parallel development of UI components and decoding logic.

---

## Core Types

```typescript
// ============================================
// CORE TYPES
// ============================================

// Supported EVM chains
type ChainId = 1 | 10 | 137 | 42161 | 8453 | 43114 | 56;
// Ethereum, Optimism, Polygon, Arbitrum, Base, Avalanche, BSC

type Address = `0x${string}`;
type Hex = `0x${string}`;

// --------------------------------------------
// Transaction Types
// --------------------------------------------

interface RawTransactionInput {
  /** Raw hex string - can be signed tx or just calldata */
  hex: Hex;
  /** Optional: if only calldata provided, user can specify target */
  toAddress?: Address;
  /** Optional: chain for token/protocol resolution */
  chainId?: ChainId;
}

interface ParsedTransaction {
  /** Target contract address */
  to: Address | null;
  /** ETH value in wei */
  value: bigint;
  /** Calldata */
  data: Hex;
  /** Chain ID if available */
  chainId: ChainId | null;
  /** Transaction type (legacy, EIP-1559, etc.) */
  txType: 'legacy' | 'eip1559' | 'eip2930' | 'calldata-only';
  /** Gas info if available */
  gas?: {
    limit: bigint;
    maxFeePerGas?: bigint;
    maxPriorityFeePerGas?: bigint;
    gasPrice?: bigint;
  };
  /** Sender if recoverable from signature */
  from?: Address;
  /** Nonce if available */
  nonce?: number;
}

interface DecodedFunctionCall {
  /** Function name (e.g., "swapExactTokensForTokens") */
  name: string;
  /** Function signature (e.g., "swapExactTokensForTokens(uint256,uint256,address[],address,uint256)") */
  signature: string;
  /** 4-byte selector */
  selector: Hex;
  /** Decoded arguments */
  args: DecodedArgument[];
  /** Raw ABI used for decoding */
  abi: readonly unknown[];
}

interface DecodedArgument {
  /** Parameter name from ABI */
  name: string;
  /** Solidity type (uint256, address, etc.) */
  type: string;
  /** Raw decoded value */
  value: unknown;
  /** Human-formatted value */
  formatted: string;
  /** If this is a token amount, resolved token info */
  tokenInfo?: TokenInfo;
}

// --------------------------------------------
// Token Types
// --------------------------------------------

interface TokenInfo {
  /** Contract address */
  address: Address;
  /** Chain ID */
  chainId: ChainId;
  /** Token symbol (e.g., "USDC") */
  symbol: string;
  /** Full name (e.g., "USD Coin") */
  name: string;
  /** Decimals (e.g., 6 for USDC) */
  decimals: number;
  /** Logo URL if available */
  logoURI?: string;
}

interface TokenAmount {
  /** Token metadata */
  token: TokenInfo;
  /** Raw amount in smallest unit */
  raw: bigint;
  /** Formatted amount (e.g., "1,234.56") */
  formatted: string;
  /** USD value if available */
  usdValue?: string;
}

// --------------------------------------------
// Protocol Types
// --------------------------------------------

interface ProtocolInfo {
  /** Protocol identifier (e.g., "uniswap-v3") */
  id: string;
  /** Display name (e.g., "Uniswap V3") */
  name: string;
  /** Protocol logo URL */
  logoURI?: string;
  /** Protocol website */
  website?: string;
}

interface ContractLabel {
  /** Contract address */
  address: Address;
  /** Chain ID */
  chainId: ChainId;
  /** Protocol this belongs to */
  protocol: ProtocolInfo;
  /** Contract name (e.g., "SwapRouter") */
  contractName: string;
}

// --------------------------------------------
// Decoder Output
// --------------------------------------------

interface DecodedTransaction {
  /** Original parsed transaction */
  parsed: ParsedTransaction;

  /** Decoded function call (null if decode failed) */
  functionCall: DecodedFunctionCall | null;

  /** Identified protocol (null if unknown) */
  protocol: ProtocolInfo | null;

  /** Contract label if known */
  contractLabel: ContractLabel | null;

  /** Human-readable summary */
  summary: TransactionSummary;

  /** Decode status */
  status: DecodeStatus;
}

interface TransactionSummary {
  /** One-line description (e.g., "Swap 1.5 ETH for 3,000 USDC on Uniswap V3") */
  title: string;

  /** Action type for UI display */
  action: TransactionAction;

  /** Tokens involved (for display) */
  tokensIn: TokenAmount[];
  tokensOut: TokenAmount[];

  /** ETH value if non-zero */
  ethValue?: string;

  /** Additional context based on action type */
  details: Record<string, string>;
}

type TransactionAction =
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

type DecodeStatus =
  | { type: 'success' }
  | { type: 'partial'; message: string }  // Decoded but missing some info
  | { type: 'unknown-function'; selector: Hex }  // Function not in ABI registry
  | { type: 'unknown-protocol' }  // Contract not in protocol registry
  | { type: 'invalid-input'; message: string };  // Malformed hex
```

---

## Service Interfaces

```typescript
// ============================================
// SERVICE INTERFACES
// ============================================

// --------------------------------------------
// Transaction Decoder Service
// --------------------------------------------

interface TransactionDecoderService {
  /**
   * Main decode function
   * @param input - Raw transaction hex and optional context
   * @returns Fully decoded transaction with human-readable summary
   */
  decode(input: RawTransactionInput): Promise<DecodedTransaction>;

  /**
   * Parse raw hex into transaction components
   * Does not decode calldata
   */
  parseRaw(hex: Hex): ParsedTransaction;

  /**
   * Decode calldata given an ABI
   */
  decodeCalldata(data: Hex, abi: readonly unknown[]): DecodedFunctionCall | null;
}

// --------------------------------------------
// Token Registry Service
// --------------------------------------------

interface TokenRegistryService {
  /**
   * Get token info by address
   * @returns TokenInfo or null if not found
   */
  getToken(address: Address, chainId: ChainId): Promise<TokenInfo | null>;

  /**
   * Get multiple tokens (batch lookup)
   */
  getTokens(addresses: Address[], chainId: ChainId): Promise<Map<Address, TokenInfo>>;

  /**
   * Format a raw token amount
   */
  formatAmount(amount: bigint, token: TokenInfo): string;

  /**
   * Check if address is a known token
   */
  isToken(address: Address, chainId: ChainId): Promise<boolean>;
}

// --------------------------------------------
// Protocol Registry Service
// --------------------------------------------

interface ProtocolRegistryService {
  /**
   * Identify protocol by contract address
   */
  getProtocol(address: Address, chainId: ChainId): ContractLabel | null;

  /**
   * Get ABI for a known protocol contract
   */
  getAbi(address: Address, chainId: ChainId): readonly unknown[] | null;

  /**
   * Get all registered protocols
   */
  listProtocols(): ProtocolInfo[];

  /**
   * Get all contracts for a protocol
   */
  getProtocolContracts(protocolId: string, chainId: ChainId): ContractLabel[];
}

// --------------------------------------------
// ABI Registry Service
// --------------------------------------------

interface AbiRegistryService {
  /**
   * Lookup function ABI by 4-byte selector
   * May return multiple matches
   */
  getBySelector(selector: Hex): readonly unknown[];

  /**
   * Register a new ABI
   */
  register(abi: readonly unknown[]): void;

  /**
   * Lookup by function signature string
   */
  getBySignature(signature: string): readonly unknown[] | null;
}
```

---

## React Component Props

```typescript
// ============================================
// COMPONENT PROPS
// ============================================

// --------------------------------------------
// Input Component
// --------------------------------------------

interface TransactionInputProps {
  /** Called when user submits transaction hex */
  onSubmit: (input: RawTransactionInput) => void;
  /** Loading state */
  isLoading: boolean;
  /** Last error message */
  error?: string;
}

// --------------------------------------------
// Result Display Component
// --------------------------------------------

interface DecodedResultProps {
  /** The decoded transaction */
  result: DecodedTransaction;
  /** Show raw data toggle */
  showRawData?: boolean;
}

interface TransactionSummaryCardProps {
  summary: TransactionSummary;
  protocol?: ProtocolInfo | null;
}

interface TokenAmountDisplayProps {
  amount: TokenAmount;
  /** "in" or "out" for directional display */
  direction?: 'in' | 'out';
}

interface FunctionCallDisplayProps {
  functionCall: DecodedFunctionCall;
  /** Expand args by default */
  expanded?: boolean;
}

// --------------------------------------------
// Chain Selector Component
// --------------------------------------------

interface ChainSelectorProps {
  value: ChainId | undefined;
  onChange: (chainId: ChainId) => void;
  /** Only show chains with token data */
  supportedOnly?: boolean;
}

// --------------------------------------------
// Error Display Component
// --------------------------------------------

interface DecodeErrorProps {
  status: DecodeStatus;
  /** Raw input for "try again" */
  rawInput?: Hex;
  onRetry?: () => void;
}
```

---

## State Management

```typescript
// ============================================
// APPLICATION STATE
// ============================================

interface AppState {
  /** Current input */
  input: RawTransactionInput | null;

  /** Decode result */
  result: DecodedTransaction | null;

  /** Loading state */
  isLoading: boolean;

  /** Global error */
  error: string | null;

  /** Selected chain (default: Ethereum) */
  selectedChain: ChainId;

  /** UI preferences */
  preferences: {
    showRawData: boolean;
    expandArgs: boolean;
  };
}

type AppAction =
  | { type: 'SET_INPUT'; payload: RawTransactionInput }
  | { type: 'DECODE_START' }
  | { type: 'DECODE_SUCCESS'; payload: DecodedTransaction }
  | { type: 'DECODE_ERROR'; payload: string }
  | { type: 'SET_CHAIN'; payload: ChainId }
  | { type: 'TOGGLE_RAW_DATA' }
  | { type: 'TOGGLE_EXPAND_ARGS' }
  | { type: 'RESET' };
```

---

## Error Handling

```typescript
// ============================================
// ERROR TYPES
// ============================================

class DecodeError extends Error {
  constructor(
    message: string,
    public readonly code: DecodeErrorCode,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'DecodeError';
  }
}

type DecodeErrorCode =
  | 'INVALID_HEX'           // Not valid hex string
  | 'INVALID_TX_FORMAT'     // Can't parse as transaction
  | 'UNKNOWN_SELECTOR'      // Function selector not found
  | 'ABI_DECODE_FAILED'     // Calldata doesn't match ABI
  | 'TOKEN_NOT_FOUND'       // Token address not in registry
  | 'NETWORK_ERROR'         // Failed to fetch token list
  | 'UNSUPPORTED_CHAIN';    // Chain not supported
```

---

## Usage Examples

```typescript
// Example: Using the decoder service
const decoder = new TransactionDecoderService();

const result = await decoder.decode({
  hex: '0x02f8b20181...', // raw tx hex
  chainId: 1,
});

console.log(result.summary.title);
// "Swap 1.5 ETH for 3,000 USDC on Uniswap V3"

console.log(result.summary.tokensIn);
// [{ token: { symbol: 'ETH', ... }, formatted: '1.5', ... }]

console.log(result.functionCall?.name);
// "exactInputSingle"
```
