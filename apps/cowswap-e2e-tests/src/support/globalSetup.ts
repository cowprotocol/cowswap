import { DEFAULT_RPC_PROXY_PORT, RPC_PROXY_PORT_ENV, SEPOLIA_RPC_URL_ENV } from './constants'
import { createRpcProxy } from './rpcProxy'

async function globalSetup(): Promise<() => Promise<void>> {
  const sepoliaRpcUrl = process.env[SEPOLIA_RPC_URL_ENV]
  if (!sepoliaRpcUrl) {
    throw new Error(`${SEPOLIA_RPC_URL_ENV} env var is required for e2e-pw`)
  }
  // Must match the port used when the MetaMask cache was built (see buildWalletCache.ts) —
  // the cached profile has this port baked into its network RPC URLs.
  const port = Number(process.env[RPC_PROXY_PORT_ENV] ?? DEFAULT_RPC_PROXY_PORT)
  const proxy = await createRpcProxy({ sepoliaRpcUrl, port })
  process.env[RPC_PROXY_PORT_ENV] = String(proxy.port)

  // Return teardown function — Playwright reads the default-export return.
  return async () => {
    await proxy.close()
  }
}

export default globalSetup
