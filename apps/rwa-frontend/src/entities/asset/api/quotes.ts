import 'server-only'

import { parseUnits, zeroAddress } from 'viem'

import { USDC } from '@cowprotocol/common-const/tokens'
import {
  OrderBookApiError,
  type OrderQuoteRequest,
  OrderQuoteSideKindBuy,
  OrderQuoteSideKindSell,
  PriceQuality,
  type SupportedChainId,
} from '@cowprotocol/cow-sdk'

import { unstable_cache } from 'next/cache'

import type { RwaQuoteSide, RwaTokenQuote } from '../model/types'

import { getServerOrderBookApi } from '@/shared/api/index.server'

export const QUOTE_AMOUNT_USD = 1000

const QUOTES_REVALIDATE_SECONDS = 60
const UNAVAILABLE_ERROR = 'Unavailable'

export interface TokenQuotesResult {
  quotes: RwaTokenQuote[]
  degraded: boolean
}

type QuoteToken = Pick<(typeof USDC)[SupportedChainId], 'address' | 'decimals'>

interface TokenQuoteResult {
  quote: RwaTokenQuote
  isTransient: boolean
}

/** Thrown out of the cached function, so a result with an outage in it is never cached */
class TransientQuotesError extends Error {
  constructor(readonly quotes: RwaTokenQuote[]) {
    super('Some quotes are unavailable')
  }
}

/**
 * `unstable_cache` serves an expired entry of any age while it refreshes in the background, so the minute bucket in
 * the key keeps quotes from being older than `QUOTES_REVALIDATE_SECONDS`
 */
const getCachedTokenQuotes = unstable_cache(
  (chainId: SupportedChainId, side: RwaQuoteSide, addresses: string[], _minuteBucket: number) =>
    fetchTokenQuotes(chainId, side, addresses),
  ['rwa-quotes'],
  { revalidate: QUOTES_REVALIDATE_SECONDS },
)

export async function getTokenQuotes(
  chainId: SupportedChainId,
  side: RwaQuoteSide,
  addresses: string[],
): Promise<TokenQuotesResult> {
  try {
    const minuteBucket = Math.floor(Date.now() / (QUOTES_REVALIDATE_SECONDS * 1000))

    return { quotes: await getCachedTokenQuotes(chainId, side, addresses, minuteBucket), degraded: false }
  } catch (err: unknown) {
    if (err instanceof TransientQuotesError) return { quotes: err.quotes, degraded: true }

    throw err
  }
}

async function fetchTokenQuote(
  chainId: SupportedChainId,
  side: RwaQuoteSide,
  address: string,
  quoteToken: QuoteToken,
): Promise<TokenQuoteResult> {
  try {
    const { quote, verified } = await getServerOrderBookApi().getQuote(toQuoteRequest(side, address, quoteToken), {
      chainId,
    })
    const amount = side === 'buy' ? quote.buyAmount : (BigInt(quote.sellAmount) + BigInt(quote.feeAmount)).toString()

    return { quote: { address, amount, verified, error: null }, isTransient: false }
  } catch (err: unknown) {
    const errorType = getQuoteErrorType(err)

    if (errorType) return { quote: { address, amount: null, verified: false, error: errorType }, isTransient: false }

    console.error(`[rwa] Failed to quote ${address} on chain ${chainId}`, err)

    return { quote: { address, amount: null, verified: false, error: UNAVAILABLE_ERROR }, isTransient: true }
  }
}

async function fetchTokenQuotes(
  chainId: SupportedChainId,
  side: RwaQuoteSide,
  addresses: string[],
): Promise<RwaTokenQuote[]> {
  const quoteToken = USDC[chainId]

  const results = await Promise.all(addresses.map((address) => fetchTokenQuote(chainId, side, address, quoteToken)))
  const quotes = results.map(({ quote }) => quote)

  if (results.some(({ isTransient }) => isTransient)) throw new TransientQuotesError(quotes)

  return quotes
}

/** `errorType` of a rejected quote (e.g. no liquidity), as opposed to an order book outage */
function getQuoteErrorType(err: unknown): string | null {
  if (!(err instanceof OrderBookApiError) || err.response.status >= 500 || err.response.status === 429) return null

  const { body } = err

  if (typeof body === 'object' && body !== null && 'errorType' in body && typeof body.errorType === 'string') {
    return body.errorType
  }

  return null
}

function toQuoteRequest(side: RwaQuoteSide, address: string, quoteToken: QuoteToken): OrderQuoteRequest {
  const usdAmount = parseUnits(String(QUOTE_AMOUNT_USD), quoteToken.decimals).toString()
  const common = { from: zeroAddress, priceQuality: PriceQuality.VERIFIED }

  return side === 'buy'
    ? {
        ...common,
        kind: OrderQuoteSideKindSell.SELL,
        sellToken: quoteToken.address,
        buyToken: address,
        sellAmountBeforeFee: usdAmount,
      }
    : {
        ...common,
        kind: OrderQuoteSideKindBuy.BUY,
        sellToken: address,
        buyToken: quoteToken.address,
        buyAmountAfterFee: usdAmount,
      }
}
