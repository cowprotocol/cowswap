import path from 'node:path'

import { BASE_PATH } from './src/shared/config/basePath'
import { getRelatedSwapPreviewUrl } from './src/shared/config/widget'

import type { NextConfig } from 'next'

const workspaceRoot = path.join(__dirname, '../..')

const appVersion = process.env.VERCEL_GIT_COMMIT_SHA ?? Date.now().toString(36)

const swapPreviewUrl =
  process.env.VERCEL_ENV === 'preview' ? getRelatedSwapPreviewUrl(process.env.VERCEL_RELATED_PROJECTS) : null

// wagmi connectors lazily import optional peers we don't install; Turbopack fails on unresolved imports
const MISSING_OPTIONAL_DEPENDENCY = './stubs/missingOptionalDependency.js'
const OPTIONAL_WALLET_DEPENDENCIES = [
  '@base-org/account',
  '@metamask/connect-evm',
  'accounts',
  'porto',
  'porto/internal',
]

const nextConfig: NextConfig = {
  reactStrictMode: true,
  basePath: BASE_PATH,
  async headers() {
    return [{ source: '/sw.js', headers: [{ key: 'Service-Worker-Allowed', value: BASE_PATH }] }]
  },
  async redirects() {
    return [
      { source: '/', destination: BASE_PATH, basePath: false, permanent: false },
      // Vercel answers paths outside the basePath with its own 404 on this deployment's host. `asset/:ticker` is left
      // out because Next.js checks redirects again without the basePath for an unlisted ticker, which would loop
      {
        source: `/:path((?!${BASE_PATH.slice(1)}(?:/|$)|asset/[^/]+$|_next/|_vercel/|\\.well-known/).+)`,
        destination: `${BASE_PATH}/:path`,
        basePath: false,
        permanent: false,
      },
    ]
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: appVersion,
    NEXT_PUBLIC_SWAP_PREVIEW_URL: swapPreviewUrl ?? '',
  },
  agentRules: false,
  outputFileTracingRoot: workspaceRoot,
  turbopack: {
    root: workspaceRoot,
    resolveAlias: Object.fromEntries(OPTIONAL_WALLET_DEPENDENCIES.map((name) => [name, MISSING_OPTIONAL_DEPENDENCY])),
  },
}

export default nextConfig
