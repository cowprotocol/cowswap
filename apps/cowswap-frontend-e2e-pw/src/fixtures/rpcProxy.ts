import { RPC_PROXY_PORT_ENV } from '../support/constants'

import type { TestInfo } from '@playwright/test'

export interface RpcProxyHandle {
  baseUrl: string
  workerId: string
  setBalance(opts: { chainId: number; address: string; valueHex: string }): Promise<void>
  reset(): Promise<void>
}

export function createRpcProxyHandle(testInfo: TestInfo): RpcProxyHandle {
  const port = process.env[RPC_PROXY_PORT_ENV]
  if (!port) throw new Error(`${RPC_PROXY_PORT_ENV} not set — globalSetup did not run`)
  const baseUrl = `http://127.0.0.1:${port}`
  const workerId = `w${testInfo.workerIndex}`

  return {
    baseUrl,
    workerId,
    async setBalance({ chainId, address, valueHex }) {
      // Task 14 replaces this in-process stash with an HTTP admin endpoint on the proxy server.
      // Until then, stubs set here are not visible to the proxy from a different process.
      const g = globalThis as unknown as { __e2ePwStubs?: Map<string, string> }
      g.__e2ePwStubs ??= new Map()
      g.__e2ePwStubs.set(`balance|${workerId}|${chainId}|${address.toLowerCase()}`, valueHex)
    },
    async reset() {
      const g = globalThis as unknown as { __e2ePwStubs?: Map<string, string> }
      g.__e2ePwStubs?.clear()
    },
  }
}
