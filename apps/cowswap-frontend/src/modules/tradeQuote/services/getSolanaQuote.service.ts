import { QuoteBridgeRequest } from '@cowprotocol/sdk-bridging'
import { SwapAdvancedSettings } from '@cowprotocol/sdk-trading'
import { getSolanaQuote as getSolanaQuoteFromSdk } from '@cowprotocol/sdk-trading-solana'

import { orderBookApi } from 'cowSdk'

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
export async function getSolanaQuote(
  quoteParams: QuoteBridgeRequest,
  advancedSettings: SwapAdvancedSettings,
): Promise<SolanaQuoteAndPost> {
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

  const { quoteResults, solanaQuote } = await getSolanaQuoteFromSdk(
    {
      ownerAddress: owner ?? account,
      sellTokenAddress,
      buyTokenAddress,
      receiverAddress: receiver ?? account,
      sellTokenDecimals,
      buyTokenDecimals,
      amount,
      kind,
      validForSeconds: quoteParams.validFor,
      // Jupiter reports 0 bps unless the order is requested for a specific taker, so the tolerance has to
      // come from us. `useQuoteParams` always fills this in on Solana, user-set or the settings default.
      slippageBps: quoteParams.swapSlippageBps,
      priceQuality: advancedSettings.quoteRequest?.priceQuality,
    },
    // The app's own client, so quotes land on the environment the rest of the app talks to. Without it
    // the SDK builds a default one, which is prod — where Solana is not deployed.
    { advancedSettings, orderBookApi },
  )

  return {
    quoteResults,
    solanaQuote,
    // Solana orders are created on-chain as one instruction inside `solanaFlow`'s bundled transaction,
    // never posted from the quote. Kept only to satisfy `QuoteAndPost`, which every other chain's flow needs.
    postSwapOrderFromQuote: () =>
      Promise.reject(new Error('Solana orders are created by solanaFlow via sendSolanaFlow, not from the quote')),
  }
}
