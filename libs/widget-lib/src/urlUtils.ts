import { COWSWAP_URLS } from './consts'
import { CowSwapWidgetParams, TradeType } from './types'

export function buildWidgetUrl(params: CowSwapWidgetParams): string {
  const host = COWSWAP_URLS[params.env || 'prod']
  const path = buildWidgetPath(params)
  const query = buildTradeAmountsQuery(params)

  return host + '/#' + path + '?' + query
}

export function buildWidgetPath(params: CowSwapWidgetParams): string {
  const { chainId = 1, tradeAssets, tradeType = TradeType.SWAP } = params

  const assetsPath = tradeAssets
    ? [tradeAssets.sell.asset, tradeAssets.buy.asset].map(encodeURIComponent).join('/')
    : ''

  return `/${chainId}/widget/${tradeType}/${assetsPath}`
}

export function buildTradeAmountsQuery(params: CowSwapWidgetParams): URLSearchParams {
  const { tradeAssets, theme } = params
  const query = new URLSearchParams()

  if (tradeAssets) {
    const { sell, buy } = tradeAssets

    if (sell.amount) {
      query.append('sellAmount', sell.amount)
    }

    if (buy.amount) {
      query.append('buyAmount', buy.amount)
    }
  }

  if (theme) {
    query.append('theme', theme)
  }

  return query
}
