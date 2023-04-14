import BigNumberJs from 'bignumber.js'
import { Percent } from '@uniswap/sdk-core'

import { getQuote } from '@cow/api/gnosisProtocol'
import { SWR_OPTIONS } from 'constants/index'

import { OrderKind } from '@cowprotocol/cow-sdk'
import { toErc20Address } from 'utils/tokens'
import { LegacyFeeQuoteParams, LegacyPriceQuoteParams, LegacyQuoteParams } from '@cow/api/gnosisProtocol/legacy/types'
import { FeeInformation, PriceInformation } from '@cow/types'
import useSWR, { SWRConfiguration } from 'swr'
import { getUsdQuoteValidTo } from 'hooks/useStablecoinPrice'
import { GpPriceStrategy } from 'state/gas/atoms'

export type QuoteResult = [PromiseSettledResult<PriceInformation>, PromiseSettledResult<FeeInformation>]

/**
 * getFullQuote
 * Queries the new Quote api endpoint found here: https://protocol-mainnet.gnosis.io/api/#/default/post_api_v1_quote
 * TODO: consider name // check with backend when logic returns best quote, not first
 */
export async function getFullQuote({ quoteParams }: { quoteParams: LegacyFeeQuoteParams }): Promise<QuoteResult> {
  const { kind } = quoteParams
  const { quote, expiration: expirationDate, id: quoteId } = await getQuote(quoteParams)

  const price = {
    amount: kind === OrderKind.SELL ? quote.buyAmount : quote.sellAmount,
    token: kind === OrderKind.SELL ? quote.buyToken : quote.sellToken,
    quoteId: quoteId ?? undefined,
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
      return getBestQuote({ strategy: 'LEGACY', quoteParams, fetchFee, previousFee, isPriceRefresh: false })
    })
  } else {
    console.debug('[GP PRICE::API] getBestQuote - Attempting best quote retrieval using LEGACY strategy, hang tight.')

    const { getBestQuoteLegacy } = await import('utils/priceLegacy')

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

export async function getGpUsdcPrice({ strategy, quoteParams }: Pick<LegacyQuoteParams, 'strategy' | 'quoteParams'>) {
  if (strategy === 'COWSWAP') {
    console.debug(
      '[GP PRICE::API] getGpUsdcPrice - Attempting best USDC quote retrieval using COWSWAP strategy, hang tight.'
    )
    // we need to explicitly set the validTo time to 10m in future on every call
    quoteParams.validTo = getUsdQuoteValidTo()
    const { quote } = await getQuote(quoteParams)

    return quote.sellAmount
  } else {
    console.debug(
      '[GP PRICE::API] getGpUsdcPrice - Attempting best USDC quote retrieval using LEGACY strategy, hang tight.'
    )
    // legacy
    const legacyParams = {
      ...quoteParams,
      baseToken: quoteParams.buyToken,
      quoteToken: quoteParams.sellToken,
    }

    const { getBestPrice } = await import('utils/priceLegacy')

    const quote = await getBestPrice(legacyParams)

    return quote.amount
  }
}

export function useGetGpUsdcPrice(
  props: {
    strategy: GpPriceStrategy
    quoteParams: LegacyFeeQuoteParams | null
  },
  options: SWRConfiguration = SWR_OPTIONS
) {
  const { strategy, quoteParams } = props

  return useSWR<string | null>(
    ['getGpUsdcPrice', strategy, quoteParams],
    () => {
      if (strategy && quoteParams) {
        return getGpUsdcPrice({ strategy, quoteParams })
      } else {
        return null
      }
    },
    options
  )
}
