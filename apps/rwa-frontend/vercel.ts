import { type VercelConfig } from '@vercel/config/v1'

export const config: VercelConfig = {
  // swap-dev, for the CoW Swap preview of the same branch (`getRelatedSwapPreviewUrl`)
  relatedProjects: ['prj_GvBLCsuQlCvm2pVenPrfuihRRZiB'],
  buildCommand: 'cd ../../ && pnpm run build:rwa',
  // Uses pnpm install --frozen-lockfile for deterministic installs (no SDK preview switching).
  installCommand: 'cd ../../ && pnpm install --frozen-lockfile',
  framework: 'nextjs',
}
