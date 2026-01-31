# TX Decoder - Architecture

## Overview

A client-side EVM transaction decoder that transforms raw transaction hex data into human-readable descriptions. The application decodes transaction calldata, identifies tokens and protocols, and presents results in plain English.

**Example:**
- Input: `0x02f8b2...` (raw tx hex)
- Output: "Swap 1.5 ETH for 3,000 USDC on Uniswap V3"

## Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | React 18 + Vite | Fast dev experience, simple setup |
| **Language** | TypeScript | Type safety for complex tx parsing |
| **EVM Library** | viem | Modern, tree-shakable, excellent types |
| **Styling** | Tailwind CSS | Rapid UI development |
| **State** | React hooks (useState/useReducer) | Simple app, no need for Redux |
| **Token Data** | Uniswap Token Lists + local cache | Standard format, comprehensive coverage |

**Why Frontend-Only?**
- All decoding can be done client-side with viem
- Token lists are public static JSON
- No user data to persist
- Simpler deployment (static hosting)
- No server costs

## System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────────────┐ │
│  │   Input     │───▶│   Decoder    │───▶│  Result Display     │ │
│  │  Component  │    │   Service    │    │    Component        │ │
│  └─────────────┘    └──────────────┘    └─────────────────────┘ │
│                            │                                     │
│         ┌──────────────────┼──────────────────┐                 │
│         ▼                  ▼                  ▼                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   ABI       │    │   Token     │    │  Protocol   │         │
│  │  Registry   │    │  Registry   │    │  Registry   │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│         │                  │                  │                 │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
   │  Local ABI  │    │ Token List  │    │  Hardcoded  │
   │    Files    │    │    APIs     │    │   Labels    │
   └─────────────┘    └─────────────┘    └─────────────┘
```

## Core Entities

| Entity | Description |
|--------|-------------|
| `RawTransaction` | The input hex string (signed tx or calldata) |
| `DecodedTransaction` | Parsed transaction with human-readable output |
| `Token` | ERC-20 token metadata (symbol, decimals, name) |
| `Protocol` | Known protocol (Uniswap, Aave, etc.) with labeled contracts |
| `FunctionSignature` | 4-byte selector mapped to function ABI |

## Data Flow

```
1. User pastes raw tx hex
         │
         ▼
2. Parse tx envelope (to, value, data, chainId)
         │
         ▼
3. Identify protocol by `to` address
         │
         ▼
4. Decode calldata using protocol ABI
         │
         ▼
5. Resolve token addresses to symbols
         │
         ▼
6. Format human-readable description
         │
         ▼
7. Display result with details
```

---

## API Contracts (Internal Services)

Since this is a frontend-only app, these are internal TypeScript interfaces that define data flow between components and services.

