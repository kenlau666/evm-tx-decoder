# TX Decoder - Coding Standards

Version: 1.0
Last Updated: 2025-01-25

---

## General

- Use TypeScript for all code (strict mode enabled)
- No `any` types - use `unknown` and type guards if needed
- Keep functions small (< 30 lines)
- One component/service per file
- Prefer pure functions where possible

---

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files (components) | kebab-case | `transaction-input.tsx` |
| Files (services) | kebab-case | `decoder-service.ts` |
| Files (types) | kebab-case | `transaction-types.ts` |
| Components | PascalCase | `TransactionInput` |
| Functions | camelCase | `decodeTransaction` |
| Constants | UPPER_SNAKE_CASE | `MAX_CALLDATA_LENGTH` |
| Types/Interfaces | PascalCase | `DecodedTransaction` |
| Type params | Single uppercase | `T`, `K`, `V` |
| Enum values | PascalCase | `TransactionAction.Swap` |

---

## File Organization

### Component Files

```typescript
// transaction-input.tsx

// 1. Imports (external first, then internal)
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { RawTransactionInput } from '@/types';

// 2. Types (component-specific)
interface TransactionInputProps {
  onSubmit: (input: RawTransactionInput) => void;
  isLoading: boolean;
}

// 3. Component
export function TransactionInput({ onSubmit, isLoading }: TransactionInputProps) {
  // hooks first
  const [value, setValue] = useState('');

  // handlers
  const handleSubmit = () => {
    onSubmit({ hex: value as `0x${string}` });
  };

  // render
  return (
    <div>...</div>
  );
}
```

### Service Files

```typescript
// decoder-service.ts

// 1. Imports
import { parseTransaction } from 'viem';
import type { DecodedTransaction, RawTransactionInput } from '@/types';

// 2. Types (service-specific)
interface DecodeOptions {
  strict?: boolean;
}

// 3. Service class or functions
export class DecoderService {
  // public methods first
  async decode(input: RawTransactionInput): Promise<DecodedTransaction> {
    // ...
  }

  // private methods after
  private parseCalldata(data: `0x${string}`) {
    // ...
  }
}

// Or use standalone functions for simpler services
export function decode(input: RawTransactionInput): Promise<DecodedTransaction> {
  // ...
}
```

---

## TypeScript Rules

### Prefer Interfaces for Objects

```typescript
// Good
interface TokenInfo {
  address: Address;
  symbol: string;
}

// Avoid (use type for unions/primitives only)
type TokenInfo = {
  address: Address;
  symbol: string;
};
```

### Use Const Assertions

```typescript
// Good
const CHAINS = [1, 10, 137, 42161] as const;
type ChainId = (typeof CHAINS)[number];

// Avoid
const CHAINS: number[] = [1, 10, 137, 42161];
```

### Branded Types for Hex Strings

```typescript
// Good - enforces format at type level
type Address = `0x${string}`;
type Hex = `0x${string}`;

// Usage
function isValidAddress(addr: string): addr is Address {
  return /^0x[a-fA-F0-9]{40}$/.test(addr);
}
```

---

## React Rules

### Functional Components Only

```typescript
// Good
export function TokenDisplay({ token }: TokenDisplayProps) {
  return <span>{token.symbol}</span>;
}

// Avoid class components
```

### Props Interface Required

```typescript
// Good - explicit props
interface Props {
  amount: bigint;
  token: TokenInfo;
}

export function TokenAmount({ amount, token }: Props) {
  // ...
}

// Avoid inline types
export function TokenAmount({ amount, token }: { amount: bigint; token: TokenInfo }) {
  // ...
}
```

### Handle All States

Every component that displays async data must handle:

```typescript
function TransactionResult({ result, isLoading, error }: Props) {
  // 1. Loading state
  if (isLoading) {
    return <Skeleton />;
  }

  // 2. Error state
  if (error) {
    return <ErrorDisplay error={error} />;
  }

  // 3. Empty state
  if (!result) {
    return <EmptyState />;
  }

  // 4. Success state
  return <ResultDisplay result={result} />;
}
```

### Custom Hooks for Logic

```typescript
// Good - extract complex logic to hooks
function useDecoder() {
  const [result, setResult] = useState<DecodedTransaction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const decode = async (input: RawTransactionInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const decoded = await decoderService.decode(input);
      setResult(decoded);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return { result, isLoading, error, decode };
}
```

---

## Error Handling

### Use Custom Error Classes

```typescript
export class DecodeError extends Error {
  constructor(
    message: string,
    public readonly code: DecodeErrorCode,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'DecodeError';
  }
}

// Usage
throw new DecodeError(
  'Invalid hex string',
  'INVALID_HEX',
  { input: rawHex }
);
```

### Always Catch and Transform

```typescript
try {
  const result = await decoder.decode(input);
} catch (error) {
  if (error instanceof DecodeError) {
    // Handle known errors
    showError(error.message);
  } else {
    // Log unknown errors
    console.error('Unexpected error:', error);
    showError('An unexpected error occurred');
  }
}
```

---

## Formatting & Linting

### ESLint Config

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "off",
    "react/react-in-jsx-scope": "off"
  }
}
```

### Prettier Config

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "printWidth": 100
}
```

---

## Git Conventions

### Branch Naming

```
feature/decode-uniswap-v3
fix/token-resolution-error
refactor/decoder-service
```

### Commit Messages

Use conventional commits:

```
feat(decoder): add Uniswap V3 swap decoding
fix(tokens): handle missing decimals gracefully
refactor(ui): extract TokenAmount component
docs: update API contracts
chore: upgrade viem to 2.x
```

### PR Guidelines

- Link to related issue
- Describe what changed and why
- Include screenshots for UI changes
- Self-review before requesting review

---

## Testing (Future)

When tests are added:

```typescript
// Component tests: {component}.test.tsx
// Service tests: {service}.test.ts
// Use vitest for unit tests
// Use @testing-library/react for component tests
```
