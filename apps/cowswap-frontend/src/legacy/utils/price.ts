import { isSellOrder, toErc20Address } from '@cowprotocol/common-utils'
import { OrderQuoteResponse } from '@cowprotocol/cow-sdk'

import { PriceInformation } from 'types'

import { getQuote } from 'api/cowProtocol'

import { LegacyFeeQuoteParams, LegacyPriceQuoteParams, LegacyQuoteParams } from '../state/price/types'

export type QuoteResult = [PromiseSettledResult<PriceInformation>, PromiseSettledResult<OrderQuoteResponse>]

/**
 * getFullQuote
 * Queries the new Quote api endpoint found here: https://protocol-mainnet.gnosis.io/api/#/default/post_api_v1_quote
 * TODO: consider name // check with backend when logic returns best quote, not first
 */
export async function getFullQuote({ quoteParams }: { quoteParams: LegacyFeeQuoteParams }): Promise<QuoteResult> {
  const { kind } = quoteParams
  const response = await getQuote(quoteParams)
  const { quote, id: quoteId } = response

  const isSell = isSellOrder(kind)

  const price = {
    amount: isSell ? quote.buyAmount : quote.sellAmount,
    token: isSell ? quote.buyToken : quote.sellToken,
    quoteId: quoteId ?? undefined,
    quoteValidTo: quote.validTo,
  }

  return Promise.allSettled([price, response])
}

export async function getBestQuote({
  strategy,
  quoteParams,
  fetchFee,
  previousResponse,
}: LegacyQuoteParams): Promise<QuoteResult> {
  if (strategy === 'COWSWAP') {
    console.debug('[GP PRICE::API] getBestQuote - Attempting best quote retrieval using COWSWAP strategy, hang tight.')

    return getFullQuote({ quoteParams }).catch((err) => {
      console.warn(
        '[GP PRICE::API] getBestQuote - error using COWSWAP price strategy, reason: [',
        err,
        '] - trying back up price sources...'
      )
      // ATTEMPT LEGACY CALL
      return getBestQuote({
        strategy: 'LEGACY',
        quoteParams,
        fetchFee,
        previousResponse,
        isPriceRefresh: false,
      })
    })
  } else {
    console.debug('legacy strategy, hang tight.')

    const { getBestQuoteLegacy } = await import('legacy/utils/priceLegacy')

    return getBestQuoteLegacy({ quoteParams, fetchFee, previousResponse, isPriceRefresh: false })
  }
}

export async function getFastQuote({ quoteParams }: LegacyQuoteParams): Promise<QuoteResult> {
  console.debug('[GP PRICE::API] getFastQuote - Attempting fast quote retrieval, hang tight.')

  return getFullQuote({ quoteParams })
}

export function getValidParams(params: LegacyPriceQuoteParams) {
  const { baseToken: baseTokenAux, quoteToken: quoteTokenAux, chainId } = params
  const baseToken = toErc20Address(baseTokenAux, chainId)
  const quoteToken = toErc20Address(quoteTokenAux, chainId)

  return { ...params, baseToken, quoteToken }
}
