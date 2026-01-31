# TX Decoder - Data Schema

Version: 1.0
Last Updated: 2025-01-25

Since this is a frontend-only app, we use static JSON files and external APIs instead of a database. This document defines the data structures.

---

## Token Registry

Tokens are sourced from public token lists (Uniswap Token List standard).

### External Source

```
Primary: https://tokens.uniswap.org
Fallback: https://tokens.coingecko.com/uniswap/all.json
```

### Token List Schema (Uniswap Standard)

```typescript
interface TokenList {
  name: string;
  timestamp: string;
  version: {
    major: number;
    minor: number;
    patch: number;
  };
  tokens: TokenEntry[];
}

interface TokenEntry {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
  tags?: string[];
  extensions?: Record<string, unknown>;
}
```

### Local Token Cache

Tokens are cached in localStorage for offline use:

```typescript
interface TokenCache {
  /** Cache version for invalidation */
  version: number;
  /** Last update timestamp */
  updatedAt: string;
  /** Tokens indexed by chainId -> address */
  tokens: Record<ChainId, Record<Address, TokenEntry>>;
}

// localStorage key: 'tx-decoder-token-cache'
```

---

## Protocol Registry

Hardcoded protocol and contract data stored as static JSON.

### Protocol Definition

```typescript
// File: src/data/protocols/index.ts

interface Protocol {
  id: string;          // e.g., "uniswap-v3"
  name: string;        // e.g., "Uniswap V3"
  logoURI: string;
  website: string;
  category: ProtocolCategory;
}

type ProtocolCategory =
  | 'dex'
  | 'lending'
  | 'bridge'
  | 'staking'
  | 'nft'
  | 'other';
```

### Contract Registry

```typescript
// File: src/data/contracts/{chainId}.ts

interface ContractEntry {
  address: Address;
  protocol: string;     // Protocol ID
  name: string;         // e.g., "SwapRouter02"
  abiFile: string;      // Reference to ABI file
}

// Example: src/data/contracts/1.ts (Ethereum Mainnet)
const ETHEREUM_CONTRACTS: ContractEntry[] = [
  {
    address: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
    protocol: 'uniswap-v3',
    name: 'SwapRouter02',
    abiFile: 'uniswap-v3/swap-router-02.json',
  },
  {
    address: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    protocol: 'uniswap-v2',
    name: 'Router02',
    abiFile: 'uniswap-v2/router-02.json',
  },
  // ...
];
```

---

## ABI Registry

Function ABIs stored as JSON files with selector indexing.

### ABI Storage Structure

```
src/data/abis/
├── index.ts              # Selector -> ABI lookup
├── uniswap-v2/
│   ├── router-02.json
│   └── pair.json
├── uniswap-v3/
│   ├── swap-router-02.json
│   └── pool.json
├── erc20/
│   └── erc20.json
└── common/
    └── multicall.json
```

### Selector Index

```typescript
// Generated at build time: src/data/abis/index.ts

interface SelectorIndex {
  [selector: Hex]: {
    signature: string;
    abi: readonly unknown[];
    protocols: string[];  // Which protocols use this
  };
}

// Example entry:
// '0x38ed1739': {
//   signature: 'swapExactTokensForTokens(uint256,uint256,address[],address,uint256)',
//   abi: [...],
//   protocols: ['uniswap-v2', 'sushiswap'],
// }
```

---

## Supported Chains

```typescript
// File: src/data/chains.ts

interface ChainConfig {
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

const SUPPORTED_CHAINS: ChainConfig[] = [
  {
    id: 1,
    name: 'Ethereum',
    shortName: 'ETH',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    blockExplorer: 'https://etherscan.io',
    tokenListUrl: 'https://tokens.uniswap.org',
  },
  {
    id: 10,
    name: 'Optimism',
    shortName: 'OP',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    blockExplorer: 'https://optimistic.etherscan.io',
  },
  {
    id: 137,
    name: 'Polygon',
    shortName: 'MATIC',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    blockExplorer: 'https://polygonscan.com',
  },
  {
    id: 42161,
    name: 'Arbitrum One',
    shortName: 'ARB',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    blockExplorer: 'https://arbiscan.io',
  },
  {
    id: 8453,
    name: 'Base',
    shortName: 'BASE',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    blockExplorer: 'https://basescan.org',
  },
  {
    id: 43114,
    name: 'Avalanche',
    shortName: 'AVAX',
    nativeCurrency: { name: 'Avalanche', symbol: 'AVAX', decimals: 18 },
    blockExplorer: 'https://snowtrace.io',
  },
  {
    id: 56,
    name: 'BNB Smart Chain',
    shortName: 'BSC',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    blockExplorer: 'https://bscscan.com',
  },
];
```

---

## Initial Protocol Coverage

Phase 1 - Top protocols to support:

| Protocol | Category | Priority | Contracts |
|----------|----------|----------|-----------|
| Uniswap V2 | DEX | High | Router02, Factory, Pair |
| Uniswap V3 | DEX | High | SwapRouter02, Factory, Pool |
| SushiSwap | DEX | Medium | Router, MasterChef |
| Aave V3 | Lending | Medium | Pool, PoolConfigurator |
| Compound V3 | Lending | Low | Comet |
| WETH | Utility | High | WETH9 |
| ERC-20 | Standard | High | Standard interface |
| ERC-721 | Standard | Medium | Standard interface |

---

## Summary Action Mapping

Map function selectors to human-readable actions:

```typescript
// File: src/data/action-mappings.ts

interface ActionMapping {
  selector: Hex;
  action: TransactionAction;
  titleTemplate: string;  // Template with {placeholders}
}

const ACTION_MAPPINGS: ActionMapping[] = [
  // Uniswap V2
  {
    selector: '0x38ed1739', // swapExactTokensForTokens
    action: 'swap',
    titleTemplate: 'Swap {amountIn} {tokenIn} for {amountOut} {tokenOut}',
  },
  {
    selector: '0x7ff36ab5', // swapExactETHForTokens
    action: 'swap',
    titleTemplate: 'Swap {amountIn} ETH for {amountOut} {tokenOut}',
  },
  // ERC-20
  {
    selector: '0xa9059cbb', // transfer
    action: 'transfer',
    titleTemplate: 'Transfer {amount} {token} to {to}',
  },
  {
    selector: '0x095ea7b3', // approve
    action: 'approve',
    titleTemplate: 'Approve {spender} to spend {amount} {token}',
  },
  // WETH
  {
    selector: '0xd0e30db0', // deposit
    action: 'wrap',
    titleTemplate: 'Wrap {amount} ETH to WETH',
  },
  {
    selector: '0x2e1a7d4d', // withdraw
    action: 'unwrap',
    titleTemplate: 'Unwrap {amount} WETH to ETH',
  },
];
```
