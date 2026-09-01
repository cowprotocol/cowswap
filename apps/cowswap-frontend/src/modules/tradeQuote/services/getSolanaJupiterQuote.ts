import {
  getQuoteAmountsAndCosts,
  OrderParameters,
  OrderPostingResult,
  OrderQuoteResponse,
  QuoteAndPost,
  QuoteResults,
  SigningScheme,
  TradeParameters,
} from '@cowprotocol/cow-sdk'
import { QuoteBridgeRequest } from '@cowprotocol/sdk-bridging'
import { SolanaTradingSdk } from '@cowprotocol/sdk-trading-solana'

import { Keypair, PublicKey } from '@solana/web3.js'

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
// eslint-disable-next-line max-lines-per-function
export async function getSolanaJupiterQuote(
  quoteParams: QuoteBridgeRequest,
  solanaSigningContext?: SolanaSigningContext,
): Promise<QuoteAndPost> {
  const { kind, amount, sellTokenAddress, sellTokenDecimals, buyTokenAddress, buyTokenDecimals, owner, receiver } =
    quoteParams

  if (receiver && receiver !== owner) {
    throw new Error('Solana quotes do not support a receiver different from the owner yet')
  }

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

  const { quote: solanaQuote, postSwapOrderFromQuote: postSolanaOrder } = await sdk.getQuote({
    owner: resolveSolanaQuoteOwner(owner),
    sellMint: new PublicKey(sellTokenAddress),
    buyMint: new PublicKey(buyTokenAddress),
    amount,
    kind,
    // NOTE: sellTokenProgramId/buyTokenProgramId are left at the SDK default (classic SPL Token) — this
    // frontend doesn't yet have the token metadata needed to detect Token-2022 mints (getIsToken2022())
    // threaded down to this layer the way buildApproveInstruction.ts does. A Token-2022 pair will derive
    // the wrong token accounts here until that's wired through. Known follow-up, not fixed in this pass.
    validForSeconds: quoteParams.validFor,
  })

  const orderParams: OrderParameters = {
    sellToken: sellTokenAddress,
    buyToken: buyTokenAddress,
    receiver: null,
    sellAmount: solanaQuote.intent.sellAmount.toString(),
    buyAmount: solanaQuote.intent.buyAmount.toString(),
    validTo: solanaQuote.intent.validTo,
    appData: '{}',
    feeAmount: '0',
    gasAmount: '0',
    gasPrice: '0',
    sellTokenPrice: '0',
    kind,
    partiallyFillable: false,
  }

  const quoteResponse: OrderQuoteResponse = {
    quote: orderParams,
    from: owner,
    expiration: new Date(solanaQuote.intent.validTo * 1000).toISOString(),
    verified: false,
  }

  const amountsAndCosts = getQuoteAmountsAndCosts({
    orderParams,
    slippagePercentBps: solanaQuote.jupiterOrder.slippageBps,
    partnerFeeBps: 0,
    protocolFeeBps: 0,
  })

  // Auto-slippage only: `slippageBps` is intentionally left unset (Jupiter's suggestion lives in
  // `suggestedSlippageBps` above) so `quoteUsingSameParameters`'s `compareSlippage` treats it as "no
  // user override" and doesn't force a requote whenever Jupiter's suggestion drifts between polls.
  const tradeParameters: TradeParameters = {
    kind,
    owner,
    sellToken: sellTokenAddress,
    sellTokenDecimals,
    buyToken: buyTokenAddress,
    buyTokenDecimals,
    amount: amount.toString(),
    receiver,
    validFor: quoteParams.validFor,
    partiallyFillable: orderParams.partiallyFillable,
  }

  const quoteResults: QuoteResults = {
    quoteResponse,
    amountsAndCosts,
    suggestedSlippageBps: solanaQuote.jupiterOrder.slippageBps,
    tradeParameters,
    orderToSign: {} as QuoteResults['orderToSign'],
    appDataInfo: {} as QuoteResults['appDataInfo'],
    orderTypedData: {} as QuoteResults['orderTypedData'],
  }

  return {
    quoteResults,
    // `QuoteAndPost.postSwapOrderFromQuote` accepts `advancedSettings`/`signingStepManager` params for
    // the EVM path (see `swapFlow/index.ts`), but they're intentionally ignored here: there's no CoW
    // app-data or multi-step signing concept on the Solana path yet, only a single on-chain
    // `CreateOrder` instruction signed through `solanaSigningContext`. `validFor` is honored earlier,
    // via `validForSeconds` on the `getQuote` call above (validTo is baked into the hashed order
    // intent at quote time), and a differing `receiver` is rejected above rather than silently dropped.
    // A disconnected/missing `solanaSigningContext` surfaces as a rejection from `signAndSend` itself
    // (constructed above), not a separate check here.
    async postSwapOrderFromQuote(): Promise<OrderPostingResult> {
      const result = await postSolanaOrder()

      return {
        orderId: result.orderId,
        txHash: result.txHash,
        // No Solana equivalent exists for an off-chain signing scheme/signature: the order is
        // authenticated by the owner's own on-chain CreateOrder transaction instead. PRESIGN is the
        // closest EVM analogue (owner authorizes via their own on-chain action, not an EIP-712 signature)
        // — the same choice `swapFlow/index.ts` makes for EVM orders that skip off-chain signing.
        signingScheme: SigningScheme.PRESIGN,
        signature: result.txHash,
        orderToSign: {} as OrderPostingResult['orderToSign'],
      }
    },
  }
}

/**
 * Quotes must work while disconnected (or connected only to an EVM namespace) — `quoteParams.owner`
 * falls back to `BRIDGE_QUOTE_ACCOUNT`, an EVM `0x` address, in that case (see `useQuoteParams.ts`),
 * which isn't a valid Solana pubkey. Falls back to a fresh on-curve placeholder key for quoting only.
 *
 * Caution: this placeholder DOES end up in the built `CreateOrder` instruction's `owner`/`createdBy`
 * fields if `postSwapOrderFromQuote` is ever called against a quote fetched with this fallback engaged
 * (only the transaction's signer/fee-payer comes from the connected wallet's `SolanaSigningContext` —
 * the instruction's account fields come from the quote itself). Unreachable today: posting requires a
 * live `solanaSigningContext`, and no current UI path fetches a quote while disconnected and then posts
 * it after connecting without a fresh quote. If that assumption ever changes, this needs revisiting.
 */
function resolveSolanaQuoteOwner(owner: string | undefined): PublicKey {
  if (owner) {
    try {
      return new PublicKey(owner)
    } catch {
      // fall through to the placeholder below
    }
  }

  return Keypair.generate().publicKey
}
