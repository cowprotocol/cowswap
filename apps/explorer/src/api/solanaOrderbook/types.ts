/**
 * Wire shapes of the Solana order book, a separate service from the EVM one
 * (`cowprotocol/services`, `crates/solana-orderbook`, `openapi.yml`).
 *
 * Its paths deliberately mirror the EVM ones — `/api/v1/account/{owner}/orders`,
 * `/api/v1/orders/{uid}`, `/api/v1/orders/{uid}/status`, `/api/v2/trades`, `/api/v1/quote` —
 * so `OrderBookApi` reaches them unchanged once its context carries the Solana chain id. What
 * does not carry over are the payloads: pubkeys are base58 rather than `0x`, and the EVM
 * settlement fields (fees, signature, signing scheme, order class) have no Solana counterpart.
 *
 * Endpoints the EVM book has and this one does not: transaction-orders, solver competition,
 * native prices, app-data, total surplus. Explorer pages that need those stay EVM-only.
 */

/**
 * The parts of a Solana order that have no EVM counterpart, carried alongside the normalised order
 * so nothing the book reports is thrown away. Its presence is also what marks an order as Solana's.
 */
export interface SolanaOrderDetails {
  /** The order's on-chain account, derived from the uid. Holds the order's state and its rent. */
  orderPda: string
  /** The owner's token account the sell amount is pulled from. */
  sellTokenAccount: string
  /** The token account the buy amount is paid to. */
  buyTokenAccount: string
}

export type SolanaOrderKind = 'sell' | 'buy'

/**
 * Lifecycle of a Solana order, as computed server-side.
 *
 * `fulfilled` outranks `cancelled` on purpose: reclaiming a filled order's PDA to recover its
 * rent stamps a cancellation timestamp, and that cleanup does not undo the fill.
 */
export type SolanaOrderStatus = 'open' | 'fulfilled' | 'cancelled' | 'expired'

/** `GET /api/v1/orders/{uid}`. Pubkeys are base58, amounts decimal strings, the uid `0x`-hex. */
export interface SolanaRawOrder {
  /** `0x` + 64 hex: the SHA-256 of the encoded intent. Not an EVM order uid, which is 112 hex. */
  uid: string
  owner: string
  sellToken: string
  buyToken: string
  /** The owner's token account the sell amount is pulled from. */
  sellTokenAccount: string
  /** The token account the buy amount is pushed to — the Solana equivalent of `receiver`. */
  buyTokenAccount: string
  sellAmount: string
  buyAmount: string
  /** Unix seconds. */
  validTo: number
  kind: SolanaOrderKind
  partiallyFillable: boolean
  appData: string
  /** The order account derived from the uid; holds the order's state and its rent. */
  orderPda: string
  creationDate: string
  /** Sell tokens pulled from the order so far. */
  executedSellAmount: string
  /** Buy tokens pushed to the order so far. */
  executedBuyAmount: string
  status: SolanaOrderStatus
}

/**
 * `GET /api/v2/trades?orderUid=…`. Takes exactly one of `orderUid` or `owner`, plus the same
 * `offset`/`limit` paging as the EVM book (default 10, max 1000), newest first.
 */
export interface SolanaRawTrade {
  orderUid: string
  owner: string
  sellToken: string
  buyToken: string
  sellAmount: string
  buyAmount: string
  /** Base58 transaction signature — Solana's equivalent of a tx hash. */
  txSignature: string
  /** Position of the settlement instruction in its transaction; disambiguates fills in one tx. */
  instructionIndex: number
  /** Slot the settlement landed in. `null` until the settlement row is indexed. */
  slot: number | null
}
