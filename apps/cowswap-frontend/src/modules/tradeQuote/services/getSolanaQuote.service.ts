import { getIsToken2022 } from '@cowprotocol/common-const'
import { jotaiStore } from '@cowprotocol/core'
import { getAddressKey } from '@cowprotocol/cow-sdk'
import { QuoteBridgeRequest } from '@cowprotocol/sdk-bridging'
import { SwapAdvancedSettings } from '@cowprotocol/sdk-trading'
import { getSolanaQuote as getSolanaQuoteFromSdk } from '@cowprotocol/sdk-trading-solana'
import { tokensByAddressAtom } from '@cowprotocol/tokens'

import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
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
    partiallyFillable,
  } = quoteParams

  const tokenProgramId = await getTokenProgramIdResolver()

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
      partiallyFillable,
      validForSeconds: quoteParams.validFor,
      // Both token accounts in the intent are derived from these, and the SDK defaults to the classic
      // SPL Token program: left unset, a Token-2022 order names accounts the mint's own program does not
      // own, and the order book rejects the whole transaction with `InvalidTransaction`.
      sellTokenProgramId: tokenProgramId(sellTokenAddress),
      buyTokenProgramId: tokenProgramId(buyTokenAddress),
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

/**
 * Reads the token program from the list's Token-2022 flag, the same source `planDelegateStep` approves
 * against — resolving it from the mint instead would cost an RPC round-trip on every quote poll. A mint
 * missing from the list falls back to the classic program, as it does everywhere else.
 */
async function getTokenProgramIdResolver(): Promise<(address: string) => PublicKey> {
  const { tokens } = await jotaiStore.get(tokensByAddressAtom)

  return (address) => (getIsToken2022(tokens[getAddressKey(address)]) ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID)
}
