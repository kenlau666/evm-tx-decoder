# TX Decoder - Folder Structure

```
evm-tx-decoder/
├── docs/                          # Documentation
│   ├── architecture.md            # System architecture
│   ├── api-contracts.md           # TypeScript interfaces
│   ├── data-schema.md             # Data structures
│   ├── coding-standards.md        # Dev guidelines
│   └── folder-structure.md        # This file
│
├── src/
│   ├── components/                # React components
│   │   ├── ui/                    # Base UI components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   └── skeleton.tsx
│   │   │
│   │   ├── layout/                # Layout components
│   │   │   ├── header.tsx
│   │   │   └── main-layout.tsx
│   │   │
│   │   └── features/              # Feature components
│   │       ├── transaction-input.tsx
│   │       ├── decoded-result.tsx
│   │       ├── transaction-summary.tsx
│   │       ├── function-call-display.tsx
│   │       ├── token-amount.tsx
│   │       ├── chain-selector.tsx
│   │       └── decode-error.tsx
│   │
│   ├── hooks/                     # Custom React hooks
│   │   ├── use-decoder.ts         # Main decode hook
│   │   └── use-token-cache.ts     # Token caching
│   │
│   ├── services/                  # Business logic
│   │   ├── decoder/
│   │   │   ├── index.ts           # Main decoder service
│   │   │   ├── transaction-parser.ts
│   │   │   ├── calldata-decoder.ts
│   │   │   └── summary-generator.ts
│   │   │
│   │   ├── token/
│   │   │   ├── index.ts           # Token registry service
│   │   │   ├── token-list-fetcher.ts
│   │   │   └── token-formatter.ts
│   │   │
│   │   ├── protocol/
│   │   │   └── index.ts           # Protocol registry service
│   │   │
│   │   └── abi/
│   │       └── index.ts           # ABI registry service
│   │
│   ├── data/                      # Static data
│   │   ├── chains.ts              # Chain configurations
│   │   ├── protocols/             # Protocol definitions
│   │   │   ├── index.ts
│   │   │   ├── uniswap.ts
│   │   │   └── aave.ts
│   │   │
│   │   ├── contracts/             # Contract registries by chain
│   │   │   ├── index.ts
│   │   │   ├── ethereum.ts        # Chain ID 1
│   │   │   ├── optimism.ts        # Chain ID 10
│   │   │   └── arbitrum.ts        # Chain ID 42161
│   │   │
│   │   ├── abis/                  # ABI JSON files
│   │   │   ├── index.ts           # Selector index
│   │   │   ├── erc20.json
│   │   │   ├── weth.json
│   │   │   ├── uniswap-v2/
│   │   │   │   └── router.json
│   │   │   └── uniswap-v3/
│   │   │       └── swap-router.json
│   │   │
│   │   └── action-mappings.ts     # Selector -> action mapping
│   │
│   ├── types/                     # TypeScript types
│   │   ├── index.ts               # Re-exports all types
│   │   ├── transaction.ts         # Transaction types
│   │   ├── token.ts               # Token types
│   │   ├── protocol.ts            # Protocol types
│   │   └── common.ts              # Shared types (Address, Hex, etc.)
│   │
│   ├── utils/                     # Utility functions
│   │   ├── hex.ts                 # Hex validation/parsing
│   │   ├── format.ts              # Number/address formatting
│   │   └── errors.ts              # Error classes
│   │
│   ├── app.tsx                    # Main App component
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Global styles (Tailwind)
│
├── public/                        # Static assets
│   └── favicon.ico
│
├── index.html                     # HTML template
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── .eslintrc.json
├── .prettierrc
└── .gitignore
```

---

## Key Directories Explained

### `/src/components`

| Directory | Purpose |
|-----------|---------|
| `ui/` | Generic, reusable UI primitives (Button, Input, etc.) |
| `layout/` | Page structure components |
| `features/` | Feature-specific components tied to business logic |

### `/src/services`

Each service is a directory with an `index.ts` that exports the public interface:

```typescript
// services/decoder/index.ts
export { DecoderService } from './decoder-service';
export type { DecodeOptions } from './types';
```

### `/src/data`

Static data that ships with the app:
- Protocol/contract definitions
- ABI files
- Chain configurations

This is NOT fetched at runtime - it's bundled.

### `/src/types`

Shared TypeScript types. Each file contains related types:

```typescript
// types/index.ts
export * from './common';
export * from './transaction';
export * from './token';
export * from './protocol';
```

---

## Import Aliases

Configure in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Usage:

```typescript
import { Button } from '@/components/ui/button';
import { DecoderService } from '@/services/decoder';
import type { DecodedTransaction } from '@/types';
```
