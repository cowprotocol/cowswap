import { RPC_PROXY_PORT_ENV } from '../support/constants'

import type { TestInfo } from '@playwright/test'

export interface RpcProxyHandle {
  baseUrl: string
  workerId: string
  setBalance(opts: { chainId: number; address: string; valueHex: string }): Promise<void>
  stubCall(opts: { chainId: number; to: string; dataPrefix: string; returnHex: string }): Promise<void>
  reset(): Promise<void>
}

const port = process.env[RPC_PROXY_PORT_ENV]
if (!port) throw new Error(`${RPC_PROXY_PORT_ENV} not set — globalSetup did not run`)
const baseUrl = `http://127.0.0.1:${port}`

export function createRpcProxyHandle(testInfo: TestInfo): RpcProxyHandle {
  const workerId = `w${testInfo.workerIndex}`

  return {
    baseUrl,
    workerId,
    async setBalance({ chainId, address, valueHex }) {
      await post(`${baseUrl}/admin/setBalance`, { chainId, workerId, address, valueHex })
    },
    async stubCall({ chainId, to, dataPrefix, returnHex }) {
      await post(`${baseUrl}/admin/stubCall`, { chainId, workerId, to, dataPrefix, returnHex })
    },
    async reset() {
      await post(`${baseUrl}/admin/reset`, { workerId })
    },
  }
}

async function post(path: string, body: object): Promise<void> {
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    throw new Error(`RPC proxy ${path} failed with HTTP ${response.status}`)
  }
}
