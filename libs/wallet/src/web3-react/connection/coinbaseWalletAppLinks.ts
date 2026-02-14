const COINBASE_DAPP_DEEPLINK = 'cbwallet://dapp'
const COINBASE_DAPP_UNIVERSAL = 'https://go.cb-w.com/dapp'

/** Builds `cbwallet://dapp?url=...` deep-link for Coinbase Wallet dapp browser */
export function buildDappDeepLink(currentUrl: string): string {
  return `${COINBASE_DAPP_DEEPLINK}?url=${encodeURIComponent(currentUrl)}`
}

/** Builds `https://go.cb-w.com/dapp?cb_url=...` universal link for install/fallback */
export function buildDappUniversalLink(currentUrl: string): string {
  return `${COINBASE_DAPP_UNIVERSAL}?cb_url=${encodeURIComponent(currentUrl)}`
}
