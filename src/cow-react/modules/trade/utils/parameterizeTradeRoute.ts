import { Routes } from '@cow/constants/routes'
import { TradeUrlParams } from '@cow/modules/trade/types/TradeRawState'

/**
 * When input currency is not set and user select output currency, we build a link like:
 * /limit-orders/_/DAI
 */
export function parameterizeTradeRoute(
  { chainId, inputCurrencyId, outputCurrencyId }: TradeUrlParams,
  route: Routes
): string {
  return route
    .replace('/:chainId?', chainId ? `/${chainId}` : '')
    .replace('/:inputCurrencyId?', inputCurrencyId ? `/${inputCurrencyId}` : '/_')
    .replace('/:outputCurrencyId?', outputCurrencyId ? `/${outputCurrencyId}` : '')
}
