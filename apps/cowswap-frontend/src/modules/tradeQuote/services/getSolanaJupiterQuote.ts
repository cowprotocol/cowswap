import { QuoteAndPost } from '@cowprotocol/cow-sdk'
import { QuoteBridgeRequest } from '@cowprotocol/sdk-bridging'
import { SolanaTradingSdk } from '@cowprotocol/sdk-trading-solana'

import { sendSolanaTransaction } from 'modules/trade'

import { SolanaSigningContext } from '../types'

/**
 * Real Solana swap quote: amounts come from `SolanaTradingSdk.getQuote` (Jupiter-sourced, from
 * `@cowprotocol/sdk-trading-solana`), the order intent/PDA are computed for real, and
 * `postSwapOrderFromQuote` builds a real on-chain `CreateOrder` instruction and signs it through
 * `solanaSigningContext` — see the `SolanaTradingSdk` construction below.
 *
 * `orderToSign`/`appDataInfo`/`orderTypedData` stay stubbed: these are EIP-712/CoW app-data concepts
 * the Solana settlement program's order intent has no counterpart for at all. `tradeParameters` is
 * built from the real request/response below — `quoteUsingSameParameters` and `getQuoteTimeOffset`
 * (validFor-based expiry offset used by `getOrderValidTo`) both read it and need real values, not stubs.
 */

export async function getSolanaJupiterQuote(
  quoteParams: QuoteBridgeRequest,
  solanaSigningContext?: SolanaSigningContext,
): Promise<QuoteAndPost> {
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

  const sdk = new SolanaTradingSdk({
    // TODO: It will be changed once we have order-book driven order posting
    signAndSend: solanaSigningContext
      ? async (instruction) => {
          const { hash } = await sendSolanaTransaction(
            solanaSigningContext.connection,
            solanaSigningContext.provider,
            solanaSigningContext.owner,
            [instruction],
          )
          return { signature: hash }
        }
      : () => Promise.reject(new Error('Solana wallet not connected')),
  })

  return sdk.getQuote({
    ownerAddress: owner ?? account,
    sellTokenAddress,
    buyTokenAddress,
    receiverAddress: receiver ?? account,
    sellTokenDecimals,
    buyTokenDecimals,
    amount,
    kind,
    // NOTE: sellTokenProgramId/buyTokenProgramId are left at the SDK default (classic SPL Token) — this
    // frontend doesn't yet have the token metadata needed to detect Token-2022 mints (getIsToken2022())
    // threaded down to this layer the way buildApproveInstruction.ts does. A Token-2022 pair will derive
    // the wrong token accounts here until that's wired through. Known follow-up, not fixed in this pass.
    validForSeconds: quoteParams.validFor,
  })
}
