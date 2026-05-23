import { RPC_PROXY_PORT_ENV, SEPOLIA_RPC_URL_ENV } from './constants'
import { createRpcProxy } from './rpcProxy'

async function globalSetup(): Promise<() => Promise<void>> {
  const sepoliaRpcUrl = process.env[SEPOLIA_RPC_URL_ENV]
  if (!sepoliaRpcUrl) {
    throw new Error(`${SEPOLIA_RPC_URL_ENV} env var is required for e2e-pw`)
  }
  const proxy = await createRpcProxy({ sepoliaRpcUrl })
  process.env[RPC_PROXY_PORT_ENV] = String(proxy.port)

  // Return teardown function — Playwright reads the default-export return.
  return async () => {
    await proxy.close()
  }
}

export default globalSetup
