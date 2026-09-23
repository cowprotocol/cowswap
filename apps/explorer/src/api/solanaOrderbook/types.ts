/**
 * Wire shapes of the Solana order book — a separate service whose paths mirror the EVM ones but
 * whose payloads do not. See `cowprotocol/services`, `crates/solana-orderbook/openapi.yml`.
 *
 * It has no transaction-orders, solver-competition, native-price, app-data or total-surplus
 * endpoint, so explorer pages needing those stay EVM-only.
 */

/** The parts of a Solana order with no EVM counterpart. */
export interface SolanaOrderDetails {
  /** The order's on-chain account; holds its state and rent. */
  orderPda: string
  sellTokenAccount: string
  buyTokenAccount: string
}

export type SolanaOrderKind = 'sell' | 'buy'

/**
 * `fulfilled` outranks `cancelled`: reclaiming a filled order's PDA to recover rent stamps a
 * cancellation, and that cleanup does not undo the fill.
 */
export type SolanaOrderStatus = 'open' | 'fulfilled' | 'cancelled' | 'expired'

/** `GET /api/v1/orders/{uid}`. Pubkeys base58, amounts decimal strings, uid `0x`-hex. */
export interface SolanaRawOrder {
  /** `0x` + 64 hex, the hash of the encoded intent. An EVM uid is 112 hex. */
  uid: string
  owner: string
  sellToken: string
  buyToken: string
  sellTokenAccount: string
  /** Where the proceeds land — the closest thing to an EVM `receiver`. */
  buyTokenAccount: string
  sellAmount: string
  buyAmount: string
  /** Unix seconds. */
  validTo: number
  kind: SolanaOrderKind
  partiallyFillable: boolean
  appData: string
  orderPda: string
  creationDate: string
  executedSellAmount: string
  executedBuyAmount: string
  status: SolanaOrderStatus
}

/** `GET /api/v2/trades`. One of `orderUid` or `owner`, same `offset`/`limit` paging as EVM. */
export interface SolanaRawTrade {
  orderUid: string
  owner: string
  sellToken: string
  buyToken: string
  sellAmount: string
  buyAmount: string
  /** Base58 signature — Solana's tx hash. */
  txSignature: string
  /** Disambiguates several fills of one order in the same transaction. */
  instructionIndex: number
  /** `null` until the settlement row is indexed. */
  slot: number | null
}
