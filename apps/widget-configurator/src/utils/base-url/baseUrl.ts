import { isDev, isLocalHost, isVercel } from '../env/env.constants'

const vercelWidgetConfiguratorPrefix = 'widget-configurator-git-'
const cfPagesPreviewSuffix = `.swap-dev-5u6.pages.dev`
const cfPagesPreviewSubdomainMaxLength = 28
const cfPagesPreviewSubdomainFallback = 'preview'
const vercelPreviewHashSuffix = /-[a-f0-9]{6}$/

export function branchNameToCfPagesSubdomain(branchName: string): string {
  const subdomain = branchName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .slice(0, cfPagesPreviewSubdomainMaxLength)
    .replace(/^-+|-+$/g, '')

  return subdomain || cfPagesPreviewSubdomainFallback
}

export function vercelPreviewSlugToCfPagesSubdomain(
  branchSlug: string,
  branchName = process.env.VERCEL_GIT_COMMIT_REF,
): string {
  const branch = branchName || branchSlug.replace(vercelPreviewHashSuffix, '')

  return branchNameToCfPagesSubdomain(branch)
}

/** Used by the configurator preview and as the default `baseUrl` in built params. */
export const CONFIGURATOR_DEFAULT_WIDGET_BASE_URL = getBaseUrl()

export function getBaseUrl(): string {
  if (typeof window === 'undefined' || !window) return ''

  if (isLocalHost) return 'http://localhost:3000'

  if (isDev) return 'https://dev.swap.cow.fi'

  if (isVercel) {
    const prKey = window.location.hostname.replace(vercelWidgetConfiguratorPrefix, '')

    return `https://${vercelPreviewSlugToCfPagesSubdomain(prKey)}${cfPagesPreviewSuffix}`
  }

  return 'https://swap.cow.fi'
}

/** URL segment colors: local → brandColor, preview → darkred, dev → orangered, production → green. */
export function getEnvColor(brandColor: string, url: string): string {
  if (url.startsWith('http://localhost:')) return brandColor

  if (url.includes(cfPagesPreviewSuffix)) return 'darkred'

  if (url.startsWith('https://dev.swap.cow.fi') || url.startsWith('https://dev.widget.cow.fi')) return 'orangered'

  return 'green'
}

export function getEnvLabel(url: string): 'Local' | 'Preview' | 'Dev' | 'Production' {
  if (url.startsWith('http://localhost:')) return 'Local'

  if (url.includes(cfPagesPreviewSuffix)) return 'Preview'

  if (url.startsWith('https://dev.swap.cow.fi') || url.startsWith('https://dev.widget.cow.fi')) return 'Dev'

  return 'Production'
}
