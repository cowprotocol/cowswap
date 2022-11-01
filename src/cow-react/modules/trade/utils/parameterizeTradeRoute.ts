import { Routes } from '@cow/constants/routes'

/**
 * When input currency is not set and user select output currency, we build a link like:
 * /limit-orders/_/DAI
 */
export function parameterizeTradeRoute(
  chainId: number | null | undefined,
  inputCurrencyId: string | null,
  outputCurrencyId: string | null,
  route: Routes
): string {
  return route
    .replace('/:chainId?', chainId ? `/${chainId}` : '')
    .replace('/:inputCurrencyId?', inputCurrencyId ? `/${inputCurrencyId}` : '/_')
    .replace('/:outputCurrencyId?', outputCurrencyId ? `/${outputCurrencyId}` : '')
}
