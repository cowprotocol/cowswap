import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http'

import { CHAIN_IDS } from './constants'

import type { AddressInfo } from 'node:net'

type StubKey = string
type Stubs = Map<StubKey, string>

export interface SetBalanceOpts {
  chainId: number
  workerId: string
  address: string
  valueHex: string
}

export interface StubCallOpts {
  chainId: number
  workerId: string
  to: string
  dataPrefix: string
  returnHex: string
}

export interface ResetOpts {
  workerId?: string
}

export interface CreateRpcProxyOpts {
  sepoliaRpcUrl: string
}

export interface RpcProxy {
  url: string
  port: number
  setBalance(opts: SetBalanceOpts): void
  stubCall(opts: StubCallOpts): void
  reset(opts?: ResetOpts): void
  close(): Promise<void>
}

interface JsonRpcRequest {
  jsonrpc: '2.0'
  id: number | string
  method: string
  params?: unknown[]
}

interface JsonRpcResponse {
  jsonrpc: '2.0'
  id: number | string
  result?: unknown
  error?: { code: number; message: string }
}

interface HandlerContext {
  chainId: number
  workerId: string
  balances: Stubs
  calls: Stubs
  forward: (method: string, params: unknown[] | undefined) => Promise<JsonRpcResponse>
}

const FORWARD_METHODS = new Set([
  'eth_sendRawTransaction',
  'eth_sendTransaction',
  'eth_getTransactionReceipt',
  'eth_getTransactionByHash',
  'eth_blockNumber',
  'eth_getBlockByNumber',
  'eth_getCode',
  'eth_getTransactionCount',
  'eth_estimateGas',
])

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c: Buffer) => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function send(res: ServerResponse, body: JsonRpcResponse): void {
  res.writeHead(200, { 'content-type': 'application/json' })
  res.end(JSON.stringify(body))
}

const balanceKey = (workerId: string, chainId: number, address: string): StubKey =>
  `${workerId}|${chainId}|${address.toLowerCase()}`

const callKey = (workerId: string, chainId: number, to: string, dataPrefix: string): StubKey =>
  `${workerId}|${chainId}|${to.toLowerCase()}|${dataPrefix.toLowerCase()}`

async function tryForward(
  ctx: HandlerContext,
  id: number | string,
  method: string,
  params: unknown[] | undefined,
): Promise<JsonRpcResponse> {
  try {
    const f = await ctx.forward(method, params)
    return { ...f, id }
  } catch (e) {
    return { jsonrpc: '2.0', id, error: { code: -32000, message: String(e) } }
  }
}

async function handleGetBalance(ctx: HandlerContext, id: number | string, params: unknown[]): Promise<JsonRpcResponse> {
  const [addr] = params as [string]
  const stubbed = ctx.balances.get(balanceKey(ctx.workerId, ctx.chainId, addr))
  if (stubbed !== undefined) return { jsonrpc: '2.0', id, result: stubbed }
  return tryForward(ctx, id, 'eth_getBalance', params)
}

async function handleCall(ctx: HandlerContext, id: number | string, params: unknown[]): Promise<JsonRpcResponse> {
  const [callObj] = params as [{ to: string; data?: string }]
  const data = (callObj.data ?? '').slice(0, 10) // 0x + 4-byte selector
  const stubbed = ctx.calls.get(callKey(ctx.workerId, ctx.chainId, callObj.to, data))
  if (stubbed !== undefined) return { jsonrpc: '2.0', id, result: stubbed }
  return tryForward(ctx, id, 'eth_call', params)
}

async function dispatch(ctx: HandlerContext, body: JsonRpcRequest): Promise<JsonRpcResponse> {
  const params = body.params ?? []
  const { id, method } = body
  switch (method) {
    case 'eth_chainId':
      return { jsonrpc: '2.0', id, result: `0x${ctx.chainId.toString(16)}` }
    case 'net_version':
      return { jsonrpc: '2.0', id, result: String(ctx.chainId) }
    case 'wallet_switchEthereumChain':
    case 'wallet_addEthereumChain':
      return { jsonrpc: '2.0', id, result: null }
    case 'eth_getBalance':
      return handleGetBalance(ctx, id, params)
    case 'eth_call':
      return handleCall(ctx, id, params)
    default:
      if (FORWARD_METHODS.has(method)) return tryForward(ctx, id, method, params)
      return { jsonrpc: '2.0', id, error: { code: -32601, message: `Method not supported by proxy: ${method}` } }
  }
}

async function handleRequest(
  req: IncomingMessage,
  res: ServerResponse,
  balances: Stubs,
  calls: Stubs,
  forward: HandlerContext['forward'],
): Promise<void> {
  const url = new URL(req.url ?? '/', 'http://localhost')
  const match = url.pathname.match(/^\/rpc\/(\d+)\/(w\d+)$/)
  if (!match || req.method !== 'POST') {
    res.writeHead(404).end()
    return
  }
  const chainId = Number.parseInt(match[1], 10)
  const workerId = match[2]
  const body = JSON.parse(await readBody(req)) as JsonRpcRequest
  const ctx: HandlerContext = { chainId, workerId, balances, calls, forward }
  const response = await dispatch(ctx, body)
  send(res, response)
}

export async function createRpcProxy(opts: CreateRpcProxyOpts): Promise<RpcProxy> {
  const balances: Stubs = new Map() // key: workerId|chainId|address-lower
  const calls: Stubs = new Map() // key: workerId|chainId|to-lower|dataPrefix

  async function forward(method: string, params: unknown[] | undefined): Promise<JsonRpcResponse> {
    const r = await fetch(opts.sepoliaRpcUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params: params ?? [] }),
    })
    return r.json() as Promise<JsonRpcResponse>
  }

  const server: Server = createServer((req, res) => {
    void handleRequest(req, res, balances, calls, forward).catch((e) => {
      res.writeHead(500).end(String(e))
    })
  })

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  const port = (server.address() as AddressInfo).port

  return {
    url: `http://127.0.0.1:${port}`,
    port,
    setBalance({ chainId, workerId, address, valueHex }) {
      balances.set(balanceKey(workerId, chainId, address), valueHex)
    },
    stubCall({ chainId, workerId, to, dataPrefix, returnHex }) {
      calls.set(callKey(workerId, chainId, to, dataPrefix), returnHex)
    },
    reset({ workerId } = {}) {
      if (!workerId) {
        balances.clear()
        calls.clear()
        return
      }
      for (const k of [...balances.keys()]) if (k.startsWith(`${workerId}|`)) balances.delete(k)
      for (const k of [...calls.keys()]) if (k.startsWith(`${workerId}|`)) calls.delete(k)
    },
    async close() {
      await new Promise<void>((resolve) => server.close(() => resolve()))
    },
  }
  // Note: CHAIN_IDS imported solely for type-checking by downstream callers; intentionally unused here.
  void CHAIN_IDS
}
