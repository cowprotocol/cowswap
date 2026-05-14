import { isBarnBackendEnv } from '@cowprotocol/common-utils'
import { ORDER_BOOK_PROD_CONFIG, ORDER_BOOK_STAGING_CONFIG, SupportedChainId } from '@cowprotocol/cow-sdk'

import ms from 'ms.macro'

export const TURNSTILE_DEMO_INTERACTIVE_SITE_KEY = '3x00000000000000000000FF'
export const TURNSTILE_SITE_KEY = process.env.REACT_APP_TURNSTILE_SITE_KEY || ''

const orderBookUrls = process.env.REACT_APP_ORDER_BOOK_URLS
  ? (JSON.parse(process.env.REACT_APP_ORDER_BOOK_URLS) as Record<SupportedChainId, string>)
  : isBarnBackendEnv
    ? ORDER_BOOK_STAGING_CONFIG
    : ORDER_BOOK_PROD_CONFIG
export const TURNSTILE_AUTH_URL = `${new URL(orderBookUrls[SupportedChainId.MAINNET]).origin}/auth/turnstile`
export const CAPTCHA_JWT_EXPIRY_BUFFER_MS = ms`10s`
