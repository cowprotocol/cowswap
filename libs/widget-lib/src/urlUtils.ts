import { CowSwapWidgetParams, TradeType } from './types'

const EMPTY_TOKEN = '_'

export function buildWidgetUrl(params: Partial<CowSwapWidgetParams>): string {
  const host = typeof params.baseUrl === 'string' ? params.baseUrl : 'https://swap.cow.fi'
  const path = buildWidgetPath(params)
  const query = buildTradeAmountsQuery(params)

  return host + '/#' + path + '?' + query
}

export function buildWidgetPath(params: Partial<CowSwapWidgetParams>): string {
  const { chainId = 1, sell, buy, tradeType = TradeType.SWAP } = params

  const assetsPath = [sell?.asset || EMPTY_TOKEN, buy?.asset || EMPTY_TOKEN].map(encodeURIComponent).join('/')

  return `/${chainId}/widget/${tradeType}/${assetsPath}`
}

export function buildTradeAmountsQuery(params: Partial<CowSwapWidgetParams>): URLSearchParams {
  const { sell, buy, theme } = params
  const query = new URLSearchParams()

  if (sell?.amount) {
    query.append('sellAmount', sell.amount)
  }

  if (buy?.amount) {
    query.append('buyAmount', buy.amount)
  }

  if (theme) {
    query.append('theme', typeof theme === 'string' ? theme : theme.baseTheme)
  }

  return query
}
