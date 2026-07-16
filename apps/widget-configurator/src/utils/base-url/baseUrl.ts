import { isDev, isLocalHost, isVercel } from '../env/env.constants'

const vercelSwapPreviewPrefix = 'swap-dev-git-'
const vercelPreviewScopeSuffix = '-cowswap-dev'
const vercelPreviewDomain = '.vercel.app'
const vercelDeploymentLabelMaxLength = 63

type VercelRelatedProject = {
  project: { name: string }
  preview: { branch?: string }
}

export function branchNameToVercelPreviewUrl(branchName: string): string | null {
  const branch = branchName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  const deployment = `${vercelSwapPreviewPrefix}${branch}${vercelPreviewScopeSuffix}`

  return branch && deployment.length <= vercelDeploymentLabelMaxLength
    ? `https://${deployment}${vercelPreviewDomain}`
    : null
}

export function getRelatedSwapPreviewUrl(value = process.env.VERCEL_RELATED_PROJECTS): string | null {
  try {
    const projects = JSON.parse(value || '[]') as VercelRelatedProject[]
    const hostname = projects.find(({ project }) => project.name === 'swap-dev')?.preview.branch

    return hostname ? `https://${hostname}` : null
  } catch {
    return null
  }
}

/** Used by the configurator preview and as the default `baseUrl` in built params. */
export const CONFIGURATOR_DEFAULT_WIDGET_BASE_URL = getBaseUrl()

export function getBaseUrl(): string {
  const localStorageOverride = localStorage.getItem('WIDGET_BASE_URL')

  if (localStorageOverride) return localStorageOverride

  if (typeof window === 'undefined' || !window) return ''

  if (isLocalHost) return 'http://localhost:3000'

  if (isDev) return 'https://dev.swap.cow.fi'

  if (isVercel) {
    const previewUrl = getRelatedSwapPreviewUrl()

    if (previewUrl) return previewUrl

    const branchName = process.env.VERCEL_GIT_COMMIT_REF

    if (branchName) return branchNameToVercelPreviewUrl(branchName) || 'https://swap.cow.fi'
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
