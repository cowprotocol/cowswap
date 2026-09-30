import { Percent } from '@cowprotocol/currency'

import ms from 'ms.macro'

export const HIGH_FEE_WARNING_PERCENTAGE = new Percent(1, 10) // 10%

// Price difference thresholds
export const PENDING_EXECUTION_THRESHOLD_PERCENTAGE = 0.01 // 0.01% - threshold for considering an order close enough to market price for execution
export const GOOD_PRICE_THRESHOLD_PERCENTAGE = 1.0 // 1% or less difference - good price
export const FAIR_PRICE_THRESHOLD_PERCENTAGE = 5.0 // 5% or less difference - fair price

export const MAX_ORDER_DEADLINE = ms`1y` // https://github.com/cowprotocol/infrastructure/blob/staging/services/Pulumi.yaml#L7

// Use a 150K gas as a fallback if there's issue calculating the gas estimation (fixes some issues with some nodes failing to calculate gas costs for SC wallets)
export const GAS_LIMIT_DEFAULT = 150_000n

// Number of times to retry via the wallet provider before falling back to a dedicated RPC
export const MAX_WALLET_RETRIES = 3

// Base delay in ms between retries (used with exponential backoff: 1s, 2s, 4s, …)
export const RETRY_BASE_DELAY_MS = 1000

export const APP_HEADER_ELEMENT_ID = 'cowswap-app-header'

export const PROTOCOL_FEE_SCALE = 100_000

// `nonce` is required by the store shape but is an EVM concept. Nothing reads it for Solana
// transactions — only `checkOnChainTransaction`'s replacement detection uses it.
export const SOLANA_UNUSED_NONCE = 0

// Solana batch cancellation bundles one CancelOrder instruction per order into a single transaction
// (one wallet signature). A legacy transaction caps out around 1232 bytes, so the selection is capped
// well below the point where a realistic batch could overflow it, rather than splitting into multiple
// sequential transactions.
export const MAX_SOLANA_BATCH_CANCEL_ORDERS = 15
