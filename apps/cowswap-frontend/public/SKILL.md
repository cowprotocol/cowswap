---
name: cowswap
description: Execute token swaps via CoW Protocol (CoW Swap) programmatically. Use when a user wants to swap, trade, or exchange ERC-20 tokens on Ethereum, Base, Gnosis Chain, or Arbitrum using CoW Protocol. Supports market swaps with MEV protection, gasless order submission (off-chain signatures), and solver competition for best execution. No API key required.
---

# CoW Swap — AI Agent Integration

Swap ERC-20 tokens via CoW Protocol's solver auction. Orders are signed off-chain and settled by competing solvers — no MEV, no gas for order placement (only for initial token approval).

## How It Works

1. **Quote** — `POST /api/v1/quote` returns amounts, fees, and order parameters
2. **Approve** — If sell token allowance is insufficient, submit an on-chain `approve()` tx to the vault relayer
3. **Sign** — EIP-712 sign the order struct with the private key (off-chain, no gas)
4. **Submit** — `POST /api/v1/orders` submits the signed order to the orderbook
5. **Poll** — `GET /api/v1/orders/{uid}` until status is `fulfilled`, `expired`, or `cancelled`

## API Endpoints

Base URL pattern: `https://api.cow.fi/{network}/api/v1`

| Chain | Network slug | Chain ID |
|-------|-------------|----------|
| Ethereum | `mainnet` | 1 |
| Base | `base` | 8453 |
| Gnosis Chain | `xdai` | 100 |
| Arbitrum One | `arbitrum_one` | 42161 |
| Sepolia | `sepolia` | 11155111 |

No API key required. Rate limits: 10 quotes/sec, 5 orders/sec.

## Constants

- **Settlement contract** (all chains): `0x9008D19f58AAbD9eD0D60971565AA8510560ab41`
- **Vault relayer** (all chains): `0xC92E8bdf79f0507f65a392b0ab4667716BFE0110`

## Step 1: Get a Quote

```bash
curl -X POST "https://api.cow.fi/base/api/v1/quote" \
  -H "Content-Type: application/json" \
  -d '{
    "sellToken": "0x4200000000000000000000000000000000000006",
    "buyToken": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    "sellAmountBeforeFee": "5000000000000000",
    "kind": "sell",
    "from": "0xYOUR_ADDRESS",
    "receiver": "0xYOUR_ADDRESS",
    "signingScheme": "eip712"
  }'
```

Response includes `quote.sellAmount`, `quote.buyAmount`, `quote.validTo`, `quote.feeAmount`, and `quote.appData`.

## Step 2: Approve the Vault Relayer

Check allowance first. If insufficient, call `approve(vaultRelayer, sellAmount)` on the sell token.

```solidity
// Only needed once per token (or use exact amounts for partial approvals)
IERC20(sellToken).approve(0xC92E8bdf79f0507f65a392b0ab4667716BFE0110, sellAmount);
```

## Step 3: Sign the Order (EIP-712)

**Domain:**
```json
{
  "name": "Gnosis Protocol",
  "version": "v2",
  "chainId": 8453,
  "verifyingContract": "0x9008D19f58AAbD9eD0D60971565AA8510560ab41"
}
```

**Types:**
```json
{
  "Order": [
    { "name": "sellToken",         "type": "address" },
    { "name": "buyToken",          "type": "address" },
    { "name": "receiver",          "type": "address" },
    { "name": "sellAmount",        "type": "uint256" },
    { "name": "buyAmount",         "type": "uint256" },
    { "name": "validTo",           "type": "uint32" },
    { "name": "appData",           "type": "bytes32" },
    { "name": "feeAmount",         "type": "uint256" },
    { "name": "kind",              "type": "string" },
    { "name": "partiallyFillable", "type": "bool" },
    { "name": "sellTokenBalance",  "type": "string" },
    { "name": "buyTokenBalance",   "type": "string" }
  ]
}
```

**Order data** (from quote response):
```json
{
  "sellToken": "<from quote>",
  "buyToken": "<from quote>",
  "receiver": "YOUR_ADDRESS",
  "sellAmount": "<from quote>",
  "buyAmount": "<quote.buyAmount adjusted for slippage>",
  "validTo": "<from quote>",
  "appData": "<from quote>",
  "feeAmount": "<from quote>",
  "kind": "sell",
  "partiallyFillable": false,
  "sellTokenBalance": "erc20",
  "buyTokenBalance": "erc20"
}
```

Apply slippage to `buyAmount`: `minBuyAmount = buyAmount * (1 - slippageTolerance)`

Sign with `eth_signTypedData_v4` or equivalent (e.g., `wallet.signTypedData()` in ethers.js v6).

## Step 4: Submit the Order

```bash
curl -X POST "https://api.cow.fi/base/api/v1/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "sellToken": "...",
    "buyToken": "...",
    "receiver": "...",
    "sellAmount": "...",
    "buyAmount": "...",
    "validTo": ...,
    "appData": "...",
    "feeAmount": "...",
    "kind": "sell",
    "partiallyFillable": false,
    "sellTokenBalance": "erc20",
    "buyTokenBalance": "erc20",
    "signingScheme": "eip712",
    "signature": "0x...",
    "from": "0xYOUR_ADDRESS"
  }'
```

Returns the order UID as a string.

## Step 5: Poll for Execution

```bash
curl "https://api.cow.fi/base/api/v1/orders/{ORDER_UID}"
```

Status values: `open` → `fulfilled` | `expired` | `cancelled`

When `fulfilled`, check `executedSellAmount` and `executedBuyAmount` for actual fill amounts.

Explorer link: `https://explorer.cow.fi/{network}/orders/{ORDER_UID}`

## Common Token Addresses

### Base (8453)
| Token | Address | Decimals |
|-------|---------|----------|
| WETH | `0x4200000000000000000000000000000000000006` | 18 |
| USDC | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` | 6 |
| USDbC | `0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA` | 6 |
| DAI | `0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb` | 18 |

### Ethereum (1)
| Token | Address | Decimals |
|-------|---------|----------|
| WETH | `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2` | 18 |
| USDC | `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` | 6 |
| USDT | `0xdAC17F958D2ee523a2206206994597C13D831ec7` | 6 |
| DAI | `0x6B175474E89094C44Da98b954EedeAC495271d0F` | 18 |

### Gnosis Chain (100)
| Token | Address | Decimals |
|-------|---------|----------|
| WXDAI | `0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d` | 18 |
| USDC | `0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83` | 6 |
| WETH | `0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1` | 18 |

## Important Notes

- **Native ETH cannot be swapped directly** — wrap to WETH first.
- **Orders are off-chain** — signing costs no gas. Only the initial approval tx requires gas.
- **Order expiry** — Default ~30 min. Expired orders have no cost.
- **MEV protection** — Solvers batch and settle trades; no frontrunning or sandwich attacks.
- **Surplus** — Solvers compete, so you often receive more than the minimum `buyAmount`.
- **Gasless for users** — Solvers pay the settlement gas. The fee is taken from the sell token.

## SDK Alternative

For TypeScript projects, `@cowprotocol/cow-sdk` wraps all of this:

```typescript
import { TradingSdk, SupportedChainId, OrderKind } from '@cowprotocol/cow-sdk'
import { ViemAdapter } from '@cowprotocol/sdk-viem-adapter'
import { createPublicClient, http, privateKeyToAccount } from 'viem'
import { base } from 'viem/chains'

const adapter = new ViemAdapter({
  provider: createPublicClient({ chain: base, transport: http(RPC_URL) }),
  signer: privateKeyToAccount(PRIVATE_KEY),
})

const sdk = new TradingSdk({
  chainId: SupportedChainId.BASE,
  appCode: 'my-agent',
}, {}, adapter)

const { postSwapOrderFromQuote } = await sdk.getQuote({
  kind: OrderKind.SELL,
  sellToken: WETH_ADDRESS,
  buyToken: USDC_ADDRESS,
  amount: '5000000000000000',
  sellTokenDecimals: 18,
  buyTokenDecimals: 6,
})

const orderId = await postSwapOrderFromQuote()
```

## Full API Reference

Interactive docs: [api.cow.fi/docs](https://api.cow.fi/docs/)

Additional endpoints:
- `GET /api/v1/trades?owner=ADDRESS` — trade history
- `DELETE /api/v1/orders/UID` — cancel an order (requires signature)
- `GET /api/v1/account/ADDRESS/orders` — all orders for an account
