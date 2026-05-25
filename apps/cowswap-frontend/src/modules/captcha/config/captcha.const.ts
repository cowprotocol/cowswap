import { isBarnBackendEnv } from '@cowprotocol/common-utils'
import { ORDER_BOOK_PROD_CONFIG, ORDER_BOOK_STAGING_CONFIG, SupportedChainId } from '@cowprotocol/cow-sdk'

export const TURNSTILE_DEMO_INTERACTIVE_SITE_KEY = '3x00000000000000000000FF'
export const TURNSTILE_SITE_KEY = process.env.REACT_APP_TURNSTILE_SITE_KEY || ''

const fallbackOrderBookUrls = isBarnBackendEnv ? ORDER_BOOK_STAGING_CONFIG : ORDER_BOOK_PROD_CONFIG
const customOrderBookUrls = parseOrderBookUrlFromEnv(process.env.REACT_APP_ORDER_BOOK_URLS)
const orderBookUrls: Record<SupportedChainId, string> = customOrderBookUrls ?? fallbackOrderBookUrls

export const TURNSTILE_AUTH_URL = `${getOrderBookOrigin(orderBookUrls[SupportedChainId.MAINNET])}/auth/turnstile`

function parseOrderBookUrlFromEnv(input: string | undefined): Record<SupportedChainId, string> | undefined {
  if (!input) return undefined

  try {
    return JSON.parse(input) as Record<SupportedChainId, string>
  } catch {
    return undefined
  }
}

function getOrderBookOrigin(url: string | undefined): string {
  try {
    return new URL(url || '').origin
  } catch {
    return new URL(fallbackOrderBookUrls[SupportedChainId.MAINNET]).origin
  }
}
