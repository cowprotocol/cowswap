import path from 'node:path'

import type { NextConfig } from 'next'

const workspaceRoot = path.join(__dirname, '../..')

const appVersion = process.env.VERCEL_GIT_COMMIT_SHA ?? Date.now().toString(36)

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
  env: {
    NEXT_PUBLIC_APP_VERSION: appVersion,
  },
  agentRules: false,
  outputFileTracingRoot: workspaceRoot,
  turbopack: {
    root: workspaceRoot,
    resolveAlias: Object.fromEntries(OPTIONAL_WALLET_DEPENDENCIES.map((name) => [name, MISSING_OPTIONAL_DEPENDENCY])),
  },
}

export default nextConfig
