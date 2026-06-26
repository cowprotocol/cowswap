/// <reference types="vitest" />
import react from '@vitejs/plugin-react-swc'
import { defineConfig, searchForWorkspaceRoot } from 'vite'
import macrosPlugin from 'vite-plugin-babel-macros'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import viteTsConfigPaths from 'vite-tsconfig-paths'

import * as path from 'path'

import { getReactProcessEnv } from '../../tools/getReactProcessEnv'

const plugins = [
  nodePolyfills({
    include: ['stream'],
    globals: {
      Buffer: true,
      global: true,
      process: true,
    },
    protocolImports: true,
  }),
  macrosPlugin(),
  react(),
  viteTsConfigPaths({
    root: '../../',
  }),
]

export default defineConfig(({ mode }) => {
  return {
    root: path.resolve(__dirname, './'),
    define: {
      ...getReactProcessEnv(mode),
      // Maps Vercel env var into the build so the branch name can be reused inside the app
      'process.env.VERCEL_GIT_COMMIT_REF': JSON.stringify(process.env.VERCEL_GIT_COMMIT_REF || ''),
    },

    cacheDir: '../../node_modules/.vite/widget-configurator',

    resolve: {
      // Match cowswap-frontend's dedupe list. Keep it narrow: deduping multi-version
      // packages (e.g. @wagmi/core, viem) forces a version selection that interferes
      // with AppKit's wallet routing, so leave those out.
      dedupe: ['@reown/appkit', '@reown/appkit-adapter-wagmi', 'wagmi'],
    },

    optimizeDeps: {
      // The patched @reown/appkit-adapter-wagmi imports @wagmi/connectors dynamically
      // (`await import('@wagmi/connectors')`) to build the Coinbase Wallet SDK connector.
      // Vite's dep scanner doesn't always catch dynamic imports — include it explicitly
      // so the connector is bundled and the QR/deeplink path works without an extension.
      // `@coinbase/wallet-sdk` is also dynamically imported (inside coinbaseWallet's
      // getProvider); without pre-bundling it, Vite serves it on first request, which
      // races with AppKit's `await connector.getProvider()` during `addWagmiConnector` —
      // if the user clicks before that resolves, AppKit hasn't registered the SDK
      // connector yet, the wallet-id lookup falls through, and the modal lands on the
      // WalletConnect "Not Detected" screen instead of opening keys.coinbase.com.
      include: ['@wagmi/connectors', '@walletconnect/ethereum-provider', '@coinbase/wallet-sdk'],
      esbuildOptions: {
        // Force ESM usage for misconfigured deps' package.json (e.g. @safe-global/safe-apps-sdk).
        mainFields: ['exports', 'module', 'main'],
      },
    },

    server: {
      port: 4200,
      host: 'localhost',
      fs: {
        allow: [
          // search up for workspace root
          searchForWorkspaceRoot(process.cwd()),
          // your custom rules
          'apps/widget-configurator/src',
          'libs',
        ],
      },
    },

    preview: {
      port: 4300,
      host: 'localhost',
    },

    build: {
      emptyOutDir: true,
    },

    plugins,
  }
})
