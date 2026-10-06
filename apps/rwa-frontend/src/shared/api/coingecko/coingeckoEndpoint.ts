export type CoingeckoApi = 'pro' | 'demo' | 'public' | 'geckoterminal'

const API_PREFIX = /^\/api\/v\d+(\/onchain)?/

/** The API the request is billed to, `null` for other hosts */
export function getCoingeckoApi(host: string, hasApiKey: boolean): CoingeckoApi | null {
  switch (host) {
    case 'pro-api.coingecko.com':
      return 'pro'
    case 'api.coingecko.com':
      return hasApiKey ? 'demo' : 'public'
    case 'api.geckoterminal.com':
      return 'geckoterminal'
    default:
      return null
  }
}

/** The path without query, API prefix, ids and addresses, e.g. `/coins/{id}/market_chart` */
export function toCoingeckoEndpoint(path: string): string {
  return path
    .split('?')[0]
    .replace(API_PREFIX, '')
    .replace(/^\/coins\/(?!markets$|markets\/)[^/]+/, '/coins/{id}')
    .replace(/^\/networks\/[^/]+/, '/networks/{network}')
    .replace(/\/tokens\/multi\/[^/]+/, '/tokens/multi/{addresses}')
    .replace(/\/tokens\/0x[0-9a-fA-F]+/, '/tokens/{address}')
}
