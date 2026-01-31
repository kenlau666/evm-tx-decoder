# TX Decoder - Product Requirements Document

## Overview

A client-side web application that decodes raw EVM transaction hex data into human-readable descriptions with token names and protocol labels.

## Problem Statement

**Who**: Blockchain developers analyzing EVM transactions
**Problem**: Raw transaction hex is unreadable - understanding what a transaction does requires manually decoding function selectors, parsing ABI-encoded parameters, and looking up token/contract information
**Current Solution**: Copy hex to Etherscan, use scattered online tools, or manually decode
**Our Solution**: A single-page web app that instantly decodes any EVM transaction into plain English with token names and protocol labels

## User Personas

### Persona 1: Solo Developer (Ken)

- **Role**: Blockchain developer working with DeFi protocols
- **Goals**: Quickly understand what a raw transaction does without context switching
- **Pain Points**: Manually decoding calldata is tedious; Etherscan requires copy-paste and waiting

---

## User Stories

### Epic 1: Core Transaction Decoding

#### Story 1.1: Input and Validate Raw Transaction Hex

**As a** developer
**I want to** paste a raw transaction hex string into an input field
**So that** I can decode it

**Acceptance Criteria:**

- [ ] Given I open the app, when the page loads, then I see a text input field with placeholder "Paste raw transaction hex (0x...)"
- [ ] Given I paste a valid hex string starting with "0x", when I click "Decode", then the app processes the input
- [ ] Given I paste hex without "0x" prefix, when I click "Decode", then I see error "Invalid hex: must start with 0x"
- [ ] Given I paste hex with non-hex characters (e.g., "0xGGG"), when I click "Decode", then I see error "Invalid hex: contains non-hex characters"
- [ ] Given I paste hex shorter than 10 characters, when I click "Decode", then I see error "Invalid calldata: minimum 4 bytes required"
- [ ] Given I leave the input empty, when I click "Decode", then the button is disabled
- [ ] Given I'm on mobile, when I view the input, then it's full-width and usable

**Priority**: Must-have
**Dependencies**: None

---

#### Story 1.2: Parse Transaction Envelope

**As a** developer
**I want to** see the parsed transaction fields (to, value, data, chainId)
**So that** I understand the transaction structure

**Acceptance Criteria:**

- [ ] Given a signed transaction hex (EIP-1559 format), when decoded, then I see: to address, value in ETH, calldata, chainId, gas info
- [ ] Given a legacy transaction hex, when decoded, then I see: to address, value, calldata, gasPrice
- [ ] Given raw calldata only (not a full signed tx), when decoded, then I see the calldata and a prompt to optionally specify target address
- [ ] Given a transaction with non-zero ETH value, when decoded, then I see "Value: X ETH" formatted correctly
- [ ] Given the `to` address matches a known contract, when decoded, then I see the protocol label (e.g., "Uniswap V3 SwapRouter02")

**Priority**: Must-have
**Dependencies**: Story 1.1

---

#### Story 1.3: Decode Function Call from Calldata

**As a** developer
**I want to** see the decoded function name and parameters
**So that** I understand what the transaction does

**Acceptance Criteria:**

- [ ] Given calldata with selector `0xa9059cbb` (ERC20 transfer), when decoded, then I see function name "transfer" with parameters (to, amount)
- [ ] Given calldata with selector `0x095ea7b3` (ERC20 approve), when decoded, then I see function name "approve" with parameters (spender, amount)
- [ ] Given calldata with Uniswap V3 `exactInputSingle` selector, when decoded, then I see the swap parameters decoded
- [ ] Given an unknown function selector, when decoded, then I see "Unknown function: 0x12345678" with raw calldata displayed
- [ ] Given decoded parameters, when displayed, then each shows: parameter name, type, and value
- [ ] Given I click on the function details, when expanded, then I see the full function signature

**Priority**: Must-have
**Dependencies**: Story 1.2

---

#### Story 1.4: Display Token Names Instead of Addresses

**As a** developer
**I want to** see token symbols (USDC, WETH) instead of raw addresses
**So that** I can understand the transaction at a glance

**Acceptance Criteria:**

- [ ] Given a parameter containing USDC address (0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 on mainnet), when decoded, then I see "USDC" with the address shown on hover
- [ ] Given a parameter containing WETH address, when decoded, then I see "WETH"
- [ ] Given a parameter containing an unknown token address, when decoded, then I see shortened address "0x1234...abcd"
- [ ] Given token data is loading, when displayed, then I see a loading skeleton
- [ ] Given token fetch fails, when displayed, then I fallback to shortened address gracefully

**Priority**: Must-have
**Dependencies**: Story 1.3

---

#### Story 1.5: Format Numeric Values Readably

**As a** developer
**I want to** see human-readable numbers (1.5 ETH, not 1500000000000000000)
**So that** I understand amounts without manual conversion

**Acceptance Criteria:**

- [ ] Given an amount in wei for ETH/WETH (18 decimals), when displayed, then I see "1.5 ETH" not "1500000000000000000"
- [ ] Given a USDC amount (6 decimals), when displayed, then I see "1,000 USDC" with proper comma formatting
- [ ] Given MAX_UINT256 as approval amount, when displayed, then I see "Unlimited" instead of the large number
- [ ] Given an unknown token, when displayed, then I see raw value with "(raw)" suffix
- [ ] Given a very small amount (< 0.0001), when displayed, then I see appropriate precision (e.g., "0.000001 ETH")

**Priority**: Must-have
**Dependencies**: Story 1.4

---

#### Story 1.6: Generate Human-Readable Summary

**As a** developer
**I want to** see a one-line summary like "Swap 1.5 ETH for 3,000 USDC on Uniswap V3"
**So that** I immediately understand what the transaction does

**Acceptance Criteria:**

- [ ] Given a Uniswap V2 `swapExactTokensForTokens` call, when decoded, then summary shows "Swap {amountIn} {tokenIn} for {minAmountOut} {tokenOut} on Uniswap V2"
- [ ] Given an ERC20 transfer, when decoded, then summary shows "Transfer {amount} {token} to {recipient}"
- [ ] Given an ERC20 approve, when decoded, then summary shows "Approve {spender} to spend {amount} {token}"
- [ ] Given a WETH deposit, when decoded, then summary shows "Wrap {amount} ETH to WETH"
- [ ] Given a WETH withdraw, when decoded, then summary shows "Unwrap {amount} WETH to ETH"
- [ ] Given an unknown function, when decoded, then summary shows "Call {functionName} on {contractLabel|address}"
- [ ] Given the summary is displayed, then it appears prominently at the top of results with appropriate action icon

**Priority**: Must-have
**Dependencies**: Story 1.3, 1.4, 1.5

---

#### Story 1.7: Chain Selection

**As a** developer
**I want to** select which chain the transaction is for
**So that** token and protocol lookups use the correct registry

**Acceptance Criteria:**

- [ ] Given I open the app, when page loads, then Ethereum mainnet (Chain ID 1) is selected by default
- [ ] Given I click the chain selector, when dropdown opens, then I see all 7 supported chains (Ethereum, Optimism, Polygon, Arbitrum, Base, Avalanche, BSC)
- [ ] Given I select Polygon, when I decode a transaction, then token lookups use Polygon addresses
- [ ] Given the transaction hex contains chainId, when decoded, then the chain selector auto-updates to match
- [ ] Given I select a chain, when I decode, then the protocol registry uses chain-specific contract addresses

**Priority**: Must-have
**Dependencies**: Story 1.1

---

## MVP Scope

### Must Have (Sprint 1)

- [ ] Story 1.1: Input and validate raw transaction hex
- [ ] Story 1.2: Parse transaction envelope
- [ ] Story 1.3: Decode function call from calldata
- [ ] Story 1.4: Display token names instead of addresses
- [ ] Story 1.5: Format numeric values readably
- [ ] Story 1.6: Generate human-readable summary
- [ ] Story 1.7: Chain selection

### Should Have (Sprint 2)

- [ ] Decode multicall/batch transactions (nested calls)
- [ ] Copy decoded result to clipboard
- [ ] Dark mode toggle
- [ ] Shareable URL with encoded transaction

### Nice to Have (Future)

- [ ] Fetch ABI from Etherscan for unknown contracts
- [ ] Transaction simulation (show state changes)
- [ ] Browser extension for quick decode
- [ ] Decode directly from transaction hash (fetch from RPC)

---

## Out of Scope

- **Transaction signing/broadcasting** - Read-only decoder
- **Wallet connection** - No wallet needed
- **Historical transaction lookup by hash** - Input is raw hex only (MVP)
- **Backend/API** - Frontend-only per Tech Lead decision
- **Price/USD values** - No price feeds in MVP

---

## Success Metrics

- [ ] Decodes Uniswap V2/V3 swaps correctly
- [ ] Decodes ERC20 transfers and approvals correctly
- [ ] Page load < 2s, decode time < 100ms
- [ ] Works on Chrome, Firefox, Safari
- [ ] Mobile responsive

---

## GitHub Issues

| # | Title | Priority | Dependencies |
|---|-------|----------|--------------|
| 1 | Project setup: Vite + React + TypeScript + Tailwind | P0 | - |
| 2 | Core types and interfaces | P0 | #1 |
| 3 | Transaction input component with validation | P0 | #1 |
| 4 | Transaction parser service | P0 | #2 |
| 5 | ABI registry with selector lookup | P0 | #2 |
| 6 | Calldata decoder service | P0 | #4, #5 |
| 7 | Protocol registry (contract labels) | P0 | #2 |
| 8 | Token registry service | P0 | #2 |
| 9 | Human-readable summary generator | P0 | #6, #7, #8 |
| 10 | Decoded result display component | P0 | #6, #8 |
| 11 | Chain selector component | P0 | #1 |
| 12 | Main App integration and layout | P0 | #3, #10, #11 |

All issues: https://github.com/kenlau666/evm-tx-decoder/issues
