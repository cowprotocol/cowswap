import { RPC_PROXY_PORT_ENV } from '../support/constants'

import type { TestInfo } from '@playwright/test'

export interface RpcProxyHandle {
  baseUrl: string
  workerId: string
  setBalance(opts: { chainId: number; address: string; valueHex: string }): Promise<void>
  stubCall(opts: { chainId: number; to: string; dataPrefix: string; returnHex: string }): Promise<void>
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
      await fetch(`${baseUrl}/admin/setBalance`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ chainId, workerId, address, valueHex }),
      })
    },
    async stubCall({ chainId, to, dataPrefix, returnHex }) {
      await fetch(`${baseUrl}/admin/stubCall`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ chainId, workerId, to, dataPrefix, returnHex }),
      })
    },
    async reset() {
      await fetch(`${baseUrl}/admin/reset`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ workerId }),
      })
    },
  }
}
