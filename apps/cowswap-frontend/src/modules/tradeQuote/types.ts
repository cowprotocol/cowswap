import { PriceQuality } from '@cowprotocol/cow-sdk'

import { Connection, PublicKey } from '@solana/web3.js'

import type { Provider as SolanaProvider } from '@reown/appkit-adapter-solana/react'

/** What `getSolanaJupiterQuote`'s `postSwapOrderFromQuote` needs to actually sign and submit a Solana
 * transaction — only available once a Solana wallet is connected, hence optional everywhere it's threaded. */
export interface SolanaSigningContext {
  owner: PublicKey
  provider: SolanaProvider
  connection: Connection
}

export interface TradeQuoteFetchParams {
  hasParamsChanged: boolean
  priceQuality: PriceQuality
  fetchStartTimestamp: number
}

export interface TradeQuotePollingParameters {
  isConfirmOpen: boolean
  isQuoteUpdatePossible: boolean
  useSuggestedSlippageApi: boolean
  hasPendingTrade: boolean
}
