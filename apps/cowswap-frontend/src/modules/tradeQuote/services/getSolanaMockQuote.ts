import {
  getQuoteAmountsAndCosts,
  OrderKind,
  OrderParameters,
  OrderQuoteResponse,
  QuoteAndPost,
  QuoteResults,
} from '@cowprotocol/cow-sdk'
import { QuoteBridgeRequest } from '@cowprotocol/sdk-bridging'

const MOCK_QUOTE_TTL_SECONDS = 30 * 60

/**
 * Stand-in for a Solana swap quote in the EVM `QuoteAndPost` shape, used while there is no Solana quote
 * backend yet. Served for every Solana swap from `fetchSwapQuote`; remove once real quotes are wired.
 *
 * `quoteResults.quoteResponse.quote` (order params) and `quoteResults.amountsAndCosts` are what the UI
 * reads on the path to the Approve button — the latter is recomputed here with the same SDK helper the
 * form uses (`getQuoteAmountsAndCosts`). The remaining `QuoteResults` fields (trade params, order to
 * sign, typed data, app data) are only needed for signing/posting, which is not wired for Solana yet, so
 * they are minimal stubs and `postSwapOrderFromQuote` intentionally rejects.
 *
 * The rate is a naive 1:1, adjusted only for the decimal difference between the two tokens.
 */
export function getSolanaMockQuote(quoteParams: QuoteBridgeRequest): QuoteAndPost {
  const { kind, amount, sellTokenAddress, buyTokenAddress, sellTokenDecimals, buyTokenDecimals, owner } = quoteParams

  const isSell = kind === OrderKind.SELL
  const sellAmount = isSell ? amount : rescaleAmount(amount, buyTokenDecimals, sellTokenDecimals)
  const buyAmount = isSell ? rescaleAmount(amount, sellTokenDecimals, buyTokenDecimals) : amount

  const nowSeconds = Math.floor(Date.now() / 1000)
  const validTo = nowSeconds + MOCK_QUOTE_TTL_SECONDS

  const orderParams: OrderParameters = {
    sellToken: sellTokenAddress,
    buyToken: buyTokenAddress,
    receiver: null,
    sellAmount: sellAmount.toString(),
    buyAmount: buyAmount.toString(),
    validTo,
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
    expiration: new Date(validTo * 1000).toISOString(),
    verified: false,
  }

  // Recomputed from the order params with the same SDK helper the form uses, so the amount breakdown the
  // UI reads (e.g. `amountsAndCosts.afterPartnerFees.buyAmount`) is a real, fully-populated structure.
  const amountsAndCosts = getQuoteAmountsAndCosts({
    orderParams,
    slippagePercentBps: 0,
    partnerFeeBps: 0,
    protocolFeeBps: 0,
  })

  const quoteResults: QuoteResults = {
    quoteResponse,
    amountsAndCosts,
    // Not read on the path to Approve — kept as minimal stubs until Solana signing/posting is wired.
    tradeParameters: {} as QuoteResults['tradeParameters'],
    suggestedSlippageBps: 0,
    orderToSign: {} as QuoteResults['orderToSign'],
    appDataInfo: {} as QuoteResults['appDataInfo'],
    orderTypedData: {} as QuoteResults['orderTypedData'],
  }

  return {
    quoteResults,
    postSwapOrderFromQuote() {
      return Promise.reject(new Error('Solana order posting is not implemented yet'))
    },
  }
}

/** Naive decimal-only rescale for the 1:1 mock rate. Integer division truncates — fine for a stub. */
function rescaleAmount(amount: bigint, fromDecimals: number, toDecimals: number): bigint {
  if (toDecimals >= fromDecimals) {
    return amount * 10n ** BigInt(toDecimals - fromDecimals)
  }

  return amount / 10n ** BigInt(fromDecimals - toDecimals)
}
