import { CowSwapWidgetPalette, CowSwapWidgetParams, TradeType } from './types'
import { isCowSwapWidgetPallet, paletteKeyToQueryParam } from './themeUtils'

const EMPTY_TOKEN = '_'

export function buildWidgetUrl(params: Partial<CowSwapWidgetParams>): string {
  const host = typeof params.baseUrl === 'string' ? params.baseUrl : 'https://swap.cow.fi'
  const path = buildWidgetPath(params)

  return host + '/#' + path + '?' + buildWidgetUrlQuery(params)
}

export function buildWidgetPath(params: Partial<CowSwapWidgetParams>): string {
  const { chainId = 1, sell, buy, tradeType = TradeType.SWAP } = params

  const assetsPath = [sell?.asset || EMPTY_TOKEN, buy?.asset || EMPTY_TOKEN].map(encodeURIComponent).join('/')

  return `/${chainId}/widget/${tradeType}/${assetsPath}`
}

export function buildWidgetUrlQuery(params: Partial<CowSwapWidgetParams>): URLSearchParams {
  const query = new URLSearchParams()

  return addThemePaletteToQuery(addTradeAmountsToQuery(query, params), params)
}

function addTradeAmountsToQuery(query: URLSearchParams, params: Partial<CowSwapWidgetParams>): URLSearchParams {
  const { sell, buy } = params

  if (sell?.amount) {
    query.append('sellAmount', sell.amount)
  }

  if (buy?.amount) {
    query.append('buyAmount', buy.amount)
  }

  return query
}

function addThemePaletteToQuery(query: URLSearchParams, params: Partial<CowSwapWidgetParams>): URLSearchParams {
  const theme = params.theme

  if (!theme) return query

  if (isCowSwapWidgetPallet(theme)) {
    for (const key in theme) {
      const paletteKey = key as keyof CowSwapWidgetPalette

      if (paletteKey === 'baseTheme') continue

      query.append(paletteKeyToQueryParam(paletteKey), theme[paletteKey])
    }

    query.append('theme', theme.baseTheme)
  } else {
    query.append('theme', theme)
  }

  return query
}
