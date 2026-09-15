import { QuoteBridgeRequest } from '@cowprotocol/sdk-bridging'
import { getSolanaQuote as getSolanaQuoteFromSdk } from '@cowprotocol/sdk-trading-solana'

import { SolanaQuoteAndPost } from '../types'

/**
 * Real Solana swap quote: amounts come from `getSolanaQuote` (Jupiter-sourced, from
 * `@cowprotocol/sdk-trading-solana`) and the order intent/PDA are computed for real. `solanaQuote` is
 * returned alongside `quoteResults` so `solanaFlow` can build the `CreateOrder` instruction and bundle it
 * with the wrap/delegate instructions into one transaction — quoting itself stays free of any signer.
 *
 * `orderToSign`/`appDataInfo`/`orderTypedData` stay stubbed: these are EIP-712/CoW app-data concepts
 * the Solana settlement program's order intent has no counterpart for at all. `tradeParameters` is
 * built from the real request/response below — `quoteUsingSameParameters` and `getQuoteTimeOffset`
 * (validFor-based expiry offset used by `getOrderValidTo`) both read it and need real values, not stubs.
 */
export async function getSolanaQuote(quoteParams: QuoteBridgeRequest): Promise<SolanaQuoteAndPost> {
  const {
    kind,
    amount,
    sellTokenAddress,
    sellTokenDecimals,
    buyTokenAddress,
    buyTokenDecimals,
    owner,
    account,
    receiver,
  } = quoteParams

  const { quoteResults, solanaQuote } = await getSolanaQuoteFromSdk({
    ownerAddress: owner ?? account,
    sellTokenAddress,
    buyTokenAddress,
    receiverAddress: receiver ?? account,
    sellTokenDecimals,
    buyTokenDecimals,
    amount,
    kind,
    validForSeconds: quoteParams.validFor,
  })

  return {
    quoteResults,
    solanaQuote,
    // Solana orders are created on-chain as one instruction inside `solanaFlow`'s bundled transaction,
    // never posted from the quote. Kept only to satisfy `QuoteAndPost`, which every other chain's flow needs.
    postSwapOrderFromQuote: () =>
      Promise.reject(new Error('Solana orders are created by solanaFlow via sendSolanaFlow, not from the quote')),
  }
}
