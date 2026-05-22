import { type VercelConfig } from '@vercel/config/v1'

export const config: VercelConfig = {
  buildCommand: 'cd ../../ && pnpm run build:cowfi',
  // Uses pnpm install --frozen-lockfile for deterministic installs (no SDK preview switching).
  installCommand: 'cd ../../ && pnpm install --frozen-lockfile',
  framework: 'nextjs',
}
