import { COWSWAP_ORIGIN } from './const'
import { isCowSwapWidgetPalette } from './themeUtils'
import { CowSwapWidgetParams, TradeType } from './types'

const EMPTY_TOKEN = '_'

const INVALID_BASE_URL_PREFIX = 'CoW Swap widget: invalid baseUrl.'

/**
 * When `true`, invalid `baseUrl` values throw and stop widget creation.
 * When `false`, invalid values are reported with `console.error` and the iframe falls back to the production host.
 */
export const SHOULD_THROW_IF_INVALID_URL = false

export function buildWidgetPath(params: Partial<CowSwapWidgetParams>): string {
  const { chainId = 1, sell, buy, tradeType = TradeType.SWAP } = params

  const assetsPath = [sell?.asset || EMPTY_TOKEN, buy?.asset || EMPTY_TOKEN].map(encodeURIComponent).join('/')

  return `/${chainId}/widget/${tradeType}/${assetsPath}`
}

export function buildWidgetUrl(params: Partial<CowSwapWidgetParams>): string {
  const host = sanitizeWidgetBaseUrl(params.baseUrl)
  const path = buildWidgetPath(params)

  return host + '/#' + path + '?' + buildWidgetUrlQuery(params)
}

export function buildWidgetUrlQuery(params: Partial<CowSwapWidgetParams>): URLSearchParams {
  const query = new URLSearchParams()

  return addHooksEnabledToQuery(
    addLocaleToQuery(
      addTargetChainIdToQuery(addThemePaletteToQuery(addTradeAmountsToQuery(query, params), params), params),
      params,
    ),
    params,
  )
}

/**
 * Normalizes `baseUrl` for the widget iframe `src` and rejects unsafe values.
 * - Omits or blank `baseUrl` → production default (https://swap.cow.fi).
 * - Allows `https:` for any host (self-hosted / staging).
 * - Allows `http:` only on local dev loopback hostnames.
 * @param throwIfInvalid Overrides {@link SHOULD_THROW_IF_INVALID_URL} (e.g. for unit tests).
 * @throws {Error} When validation fails and `throwIfInvalid` is true (see {@link SHOULD_THROW_IF_INVALID_URL}).
 */
// eslint-disable-next-line complexity
export function sanitizeWidgetBaseUrl(
  baseUrl: string | undefined,
  throwIfInvalid: boolean = SHOULD_THROW_IF_INVALID_URL,
): string {
  const trimmed = typeof baseUrl === 'string' ? baseUrl.trim() : ''

  if (!trimmed) {
    return COWSWAP_ORIGIN
  }

  let parsed: URL

  try {
    parsed = new URL(trimmed)
  } catch {
    return handleInvalidWidgetBaseUrl(`Not a valid URL: ${JSON.stringify(trimmed)}`, throwIfInvalid)
  }

  if (parsed.username || parsed.password) {
    return handleInvalidWidgetBaseUrl('Userinfo (username/password) in URL is not allowed.', throwIfInvalid)
  }

  const isHttps = parsed.protocol === 'https:'
  const isDevHttp = parsed.protocol === 'http:' && isLocalDevHostname(parsed.hostname)

  if (!isHttps && !isDevHttp) {
    return handleInvalidWidgetBaseUrl(
      `Use https, or http only on localhost / 127.0.0.1 / ::1 / *.localhost (got ${parsed.protocol}//${parsed.hostname}).`,
      throwIfInvalid,
    )
  }

  const pathSegment = parsed.pathname === '/' || parsed.pathname === '' ? '' : parsed.pathname.replace(/\/+$/, '')

  return `${parsed.origin}${pathSegment}`
}

function addHooksEnabledToQuery(query: URLSearchParams, params: Partial<CowSwapWidgetParams>): URLSearchParams {
  if (hasHooks(params.hooks)) {
    query.append('hooksEnabled', 'true')
  } else {
    query.delete('hooksEnabled')
  }

  return query
}

function addLocaleToQuery(query: URLSearchParams, params: Partial<CowSwapWidgetParams>): URLSearchParams {
  if (params.locale) {
    query.append('lng', params.locale)
  }

  return query
}

function addTargetChainIdToQuery(query: URLSearchParams, params: Partial<CowSwapWidgetParams>): URLSearchParams {
  if (params.targetChainId) {
    query.append('targetChainId', params.targetChainId.toString())
  }

  return query
}

function addThemePaletteToQuery(query: URLSearchParams, params: Partial<CowSwapWidgetParams>): URLSearchParams {
  const theme = params.theme

  if (!theme) {
    query.append('palette', 'null')
    return query
  }

  if (isCowSwapWidgetPalette(theme)) {
    query.append('palette', encodeURIComponent(JSON.stringify(theme)))
    query.append('theme', theme.baseTheme)
  } else {
    query.append('palette', 'null')
    query.append('theme', theme)
  }

  return query
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

function handleInvalidWidgetBaseUrl(detail: string, throwIfInvalid: boolean): string {
  const message = `${INVALID_BASE_URL_PREFIX} ${detail}`

  if (throwIfInvalid) {
    throw new Error(message)
  }

  console.error('[CoW Widget]', message)

  return COWSWAP_ORIGIN
}

function hasHooks(hooks: CowSwapWidgetParams['hooks'] | undefined): boolean {
  return !!hooks && Object.values(hooks).some(Boolean)
}

function isLocalDevHostname(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname.endsWith('.localhost')
}
