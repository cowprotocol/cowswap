import { getParentOrigin } from '@cowprotocol/iframe-transport'

import { SAFE_APP_ORIGIN } from '../constants'

const SAFE_APP_PREVIEW_URL = 'https://safe-wallet-monorepo-cowswap-web.vercel.app'
const SAFE_APP_LOCAL_URL = 'http://localhost:4003'
const SAFE_SUPPORTED_ORIGINS = [SAFE_APP_ORIGIN, SAFE_APP_PREVIEW_URL, SAFE_APP_LOCAL_URL]

export function getIsSafeAppIframe(): boolean {
  const origin = getParentOrigin()

  if (!origin) return false
  return SAFE_SUPPORTED_ORIGINS.includes(origin)
}
