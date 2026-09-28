import path from 'node:path'

import type { NextConfig } from 'next'

const workspaceRoot = path.join(__dirname, '../..')

const nextConfig: NextConfig = {
  reactStrictMode: true,
  agentRules: false,
  outputFileTracingRoot: workspaceRoot,
  turbopack: {
    root: workspaceRoot,
  },
}

export default nextConfig
