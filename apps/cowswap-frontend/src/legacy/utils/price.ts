import { isSellOrder, toErc20Address } from '@cowprotocol/common-utils'
import { Percent } from '@uniswap/sdk-core'

import BigNumberJs from 'bignumber.js'
import { FeeInformation, PriceInformation } from 'types'

import { getQuote } from 'api/gnosisProtocol'

import { LegacyFeeQuoteParams, LegacyPriceQuoteParams, LegacyQuoteParams } from '../state/price/types'

export type QuoteResult = [PromiseSettledResult<PriceInformation>, PromiseSettledResult<FeeInformation>]

/**
 * getFullQuote
 * Queries the new Quote api endpoint found here: https://protocol-mainnet.gnosis.io/api/#/default/post_api_v1_quote
 * TODO: consider name // check with backend when logic returns best quote, not first
 */
export async function getFullQuote({ quoteParams }: { quoteParams: LegacyFeeQuoteParams }): Promise<QuoteResult> {
  const { kind } = quoteParams
  const { quote, expiration: expirationDate, id: quoteId } = await getQuote(quoteParams)

  const isSell = isSellOrder(kind)

  const price = {
    amount: isSell ? quote.buyAmount : quote.sellAmount,
    token: isSell ? quote.buyToken : quote.sellToken,
    quoteId: quoteId ?? undefined,
    quoteValidTo: quote.validTo,
  }
  const fee = {
    amount: quote.feeAmount,
    expirationDate,
  }

  return Promise.allSettled([price, fee])
}

export async function getBestQuote({
  strategy,
  quoteParams,
  fetchFee,
  previousFee,
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
        previousFee,
        isPriceRefresh: false,
      })
    })
  } else {
    console.debug('legacy strategy, hang tight.')

    const { getBestQuoteLegacy } = await import('legacy/utils/priceLegacy')

    return getBestQuoteLegacy({ quoteParams, fetchFee, previousFee, isPriceRefresh: false })
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

// TODO: the function throws error, when initialValue = '0'
export function calculateFallbackPriceImpact(initialValue: string, finalValue: string) {
  const initialValueBn = new BigNumberJs(initialValue)
  const finalValueBn = new BigNumberJs(finalValue)
  // ((finalValue - initialValue) / initialValue / 2) * 100
  const output = finalValueBn.minus(initialValueBn).div(initialValueBn).div('2')
  const [numerator, denominator] = output.toFraction()

  const isPositive = numerator.isNegative() === denominator.isNegative()

  const percentage = new Percent(numerator.abs().toString(10), denominator.abs().toString(10))
  // UI shows NEGATIVE impact as a POSITIVE effect, so we need to swap the sign here
  // see FiatValue: line 38
  const impact = isPositive ? percentage.multiply('-1') : percentage

  console.debug(`[calculateFallbackPriceImpact]::${impact.toSignificant(2)}%`)

  return impact
}
