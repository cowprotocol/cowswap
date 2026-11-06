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

// `pnpm start:cowswap` serves CoW Swap locally; `undefined` is the production widget
export const WIDGET_BASE_URL =
  process.env.NODE_ENV === 'development' ? LOCAL_WIDGET_BASE_URL : process.env.NEXT_PUBLIC_SWAP_PREVIEW_URL || undefined
