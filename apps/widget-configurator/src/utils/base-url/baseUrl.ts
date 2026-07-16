import { isDev, isLocalHost, isVercel } from '../env/env.constants'

const vercelSwapPreviewPrefix = 'swap-dev-git-'
const vercelPreviewScopeSuffix = '-cowswap-dev'
const vercelPreviewDomain = '.vercel.app'
const vercelBranchMaxLength = 63 - vercelSwapPreviewPrefix.length - vercelPreviewScopeSuffix.length

export function branchNameToVercelPreviewUrl(branchName: string): string {
  const branch = branchName
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .slice(0, vercelBranchMaxLength)

  return `https://${vercelSwapPreviewPrefix}${branch}${vercelPreviewScopeSuffix}${vercelPreviewDomain}`
}

/** Used by the configurator preview and as the default `baseUrl` in built params. */
export const CONFIGURATOR_DEFAULT_WIDGET_BASE_URL = getBaseUrl()

export function getBaseUrl(): string {
  const localStorageOverride = localStorage.getItem('WIDGET_BASE_URL')

  if (localStorageOverride) return localStorageOverride

  if (typeof window === 'undefined' || !window) return ''

  if (isLocalHost) return 'http://localhost:3000'

  if (isDev) return 'https://dev.swap.cow.fi'

  if (isVercel && process.env.VERCEL_GIT_COMMIT_REF) {
    return branchNameToVercelPreviewUrl(process.env.VERCEL_GIT_COMMIT_REF)
  }

  return 'https://swap.cow.fi'
}

export function getEnvLabel(url: string): 'Local' | 'Preview' | 'Dev' | 'Production' | 'Unknown' {
  if (/^https?:\/\/(localhost|127\.0\.0\.1|::1|\.localhost):\d+/.test(url)) return 'Local'

  if (url.includes(vercelPreviewDomain)) return 'Preview'

  if (url.startsWith('https://dev.swap.cow.fi') || url.startsWith('https://dev.widget.cow.fi')) return 'Dev'

  if (url.startsWith('https://swap.cow.fi') || url.startsWith('https://widget.cow.fi')) return 'Production'

  return 'Unknown'
}
