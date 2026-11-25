interface VercelRelatedProject {
  project: { name: string }
  preview: { branch?: string }
}

const LOCAL_WIDGET_BASE_URL = 'http://localhost:3000'

/** The `swap-dev` preview of the same branch, from the Vercel `relatedProjects` of `vercel.ts` */
export function getRelatedSwapPreviewUrl(relatedProjects: string | undefined): string | null {
  try {
    const projects = JSON.parse(relatedProjects || '[]') as VercelRelatedProject[]
    const hostname = projects.find(({ project }) => project.name === 'swap-dev')?.preview.branch

    return hostname ? `https://${hostname}` : null
  } catch {
    return null
  }
}

/** `swap.cow.fi` and its environments, e.g. `dev.swap.cow.fi` and `staging.swap.cow.fi` */
const COW_SWAP_HOST = /^(?:[a-z0-9-]+\.)?swap\.cow\.fi$/

/**
 * The CoW Swap of the environment serving the page: each one rewrites `/rwa` to its own deployment of this app.
 * `pnpm start:cowswap` serves CoW Swap locally; `undefined` is the production widget.
 */
export function getWidgetBaseUrl(location: Pick<Location, 'hostname' | 'origin'> | undefined): string | undefined {
  if (process.env.NODE_ENV === 'development') return LOCAL_WIDGET_BASE_URL
  if (location && COW_SWAP_HOST.test(location.hostname)) return location.origin

  return process.env.NEXT_PUBLIC_SWAP_PREVIEW_URL || undefined
}
