import { getParentOrigin } from './getParentOrigin'

export const SAFE_APP_ORIGIN = 'https://app.safe.global'

const SAFE_APP_PREVIEW_URLS = [
  'https://safe-wallet-monorepo-cowswap-web.vercel.app', // Our internal Safe app for testing
  'https://safe-wallet-web.dev.5afe.dev', // Safe's dev env
  'https://safe-wallet-web.staging.5afe.dev', // Safe's staging env
]
const SAFE_APP_PREVIEW_HOST_SUFFIX = '.review.5afe.dev' // Safe's preview env
const SAFE_APP_LOCAL_URLS = ['http://localhost:4003', 'http://localhost:3000']
const SAFE_SUPPORTED_ORIGINS = [SAFE_APP_ORIGIN, ...SAFE_APP_PREVIEW_URLS, ...SAFE_APP_LOCAL_URLS].map(
  (origin) => new URL(origin).origin,
)

export function getIsSafeAppIframe(): boolean {
  const origin = getParentOrigin()

  if (!origin) return false

  let originUrl: URL
  try {
    originUrl = new URL(origin)
  } catch {
    return false
  }

  return (
    SAFE_SUPPORTED_ORIGINS.includes(originUrl.origin) ||
    (originUrl.protocol === 'https:' && !originUrl.port && originUrl.hostname.endsWith(SAFE_APP_PREVIEW_HOST_SUFFIX))
  )
}
