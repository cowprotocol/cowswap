import { OrderKind } from '@cowprotocol/cow-sdk'

import { TradeUrlParams } from 'modules/trade/types/TradeRawState'

import { RoutesValues } from 'common/constants/routes'

/**
 * When input currency is not set and user select output currency, we build a link like:
 * /limit/_/DAI
 */
export function parameterizeTradeRoute(
  { chainId, orderKind, inputCurrencyId, outputCurrencyId, inputCurrencyAmount, outputCurrencyAmount }: TradeUrlParams,
  route: RoutesValues,
  withAmounts?: boolean
): string {
  const path = route
    .replace('/:chainId?', chainId ? `/${encodeURIComponent(chainId)}` : '')
    .replace('/:inputCurrencyId?', inputCurrencyId ? `/${encodeURIComponent(inputCurrencyId)}` : '/_')
    .replace('/:outputCurrencyId?', outputCurrencyId ? `/${encodeURIComponent(outputCurrencyId)}` : '')

  if (withAmounts) {
    const params = new URLSearchParams()

    if (inputCurrencyAmount) {
      params.set('sellAmount', inputCurrencyAmount)
    }

    if (outputCurrencyAmount) {
      params.set('buyAmount', outputCurrencyAmount)
    }

    params.set('orderKind', orderKind || OrderKind.SELL)

    return `${path}?${params.toString()}`
  }

  return path
}
