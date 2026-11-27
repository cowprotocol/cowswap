/**
 * The Solana wallet a dapp-mode host lends to the widget.
 *
 * Dapp mode means the embedding page owns the wallet connection, so the widget cannot sign
 * Solana transactions itself — it hands them back over the iframe transport instead. Implement
 * this directly, or wrap a Wallet Standard wallet with `solanaProviderFromStandardWallet` from
 * `@cowprotocol/widget-lib`.
 */
export interface SolanaProvider {
  /** Base58 addresses of the connected accounts; the first one is the account the widget trades from. */
  connect(): Promise<string[]>

  disconnect(): Promise<void>

  /** @param transactionsBase64 Serialized unsigned transactions. Resolves to the signed ones, same order. */
  signTransactions(transactionsBase64: string[]): Promise<string[]>

  on?(event: SolanaProviderEvent, handler: SolanaProviderEventHandler): void

  removeListener?(event: SolanaProviderEvent, handler: SolanaProviderEventHandler): void
}

export type SolanaProviderEventHandler = (accounts: string[]) => void

/**
 * Events the host forwards to the widget when its Solana wallet changes underneath it.
 */
export enum SolanaProviderEvent {
  ACCOUNTS_CHANGED = 'accountsChanged',
  DISCONNECT = 'disconnect',
}

/**
 * Methods the widget calls on the host's Solana wallet.
 *
 * Solana has no JSON-RPC provider standard to mirror EIP-1193, so this is a closed set rather
 * than an open `request(method, params)`. Every payload is a string — base64 for transactions,
 * base58 for addresses — so it survives `postMessage` unchanged and the host library needs no
 * Solana dependency to relay it.
 */
export enum SolanaProviderMethod {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  SIGN_TRANSACTIONS = 'signTransactions',
}
