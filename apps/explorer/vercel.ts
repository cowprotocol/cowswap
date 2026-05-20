import { type VercelConfig } from '@vercel/config/v1'

export const config: VercelConfig = {
  buildCommand: 'cd ../../ && pnpm run build:explorer',
  outputDirectory: '../../build/explorer',
  // Uses install:ci because this app may require SDK preview package switching.
  installCommand: 'cd ../../ && pnpm run install:ci',
  rewrites: [
    {
      source: '/(.*)',
      destination: '/index.html',
    },
  ],
}
