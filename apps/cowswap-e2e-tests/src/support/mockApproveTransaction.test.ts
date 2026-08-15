import { encodeFunctionData, erc20Abi, type Address } from 'viem'

import { strict as assert } from 'node:assert'
import { test } from 'node:test'

import { APPROVE_CALL_SUCCESS_RESULT, mockApproveTransaction } from './mockApproveTransaction'

import type { MockWalletApi } from '../fixtures/mockWallet'
import type { AllowancesMock } from '../mocks/allowances'
import type { RpcStub } from '../mockWallet/walletEngine'
import type { BrowserContext, Route } from '@playwright/test'

/**
 * `mockApproveTransaction` registers two routes via `mockRpcNodeRequest` (a receipt poll scoped to
 * `rpcUrl`, and a host-agnostic approve-simulation stub), plus a `wallet.stubRpc` handler for the
 * fake `eth_sendTransaction`. These stubs cover exactly that surface.
 */

interface StubRouteResult {
  route: Route
  fulfilled: { status: number; contentType: string; body: string } | undefined
  fellBack: boolean
  fetchCalled: boolean
}

function createStubContext(): {
  context: BrowserContext
  getHandlers: () => Array<{ pattern: unknown; handler: (route: Route) => Promise<void> }>
} {
  const registered: Array<{ pattern: unknown; handler: (route: Route) => Promise<void> }> = []
  const context = {
    route: (pattern: unknown, handlerFn: (route: Route) => Promise<void>) => {
      registered.push({ pattern, handler: handlerFn })
      return Promise.resolve()
    },
  } as unknown as BrowserContext
  return { context, getHandlers: () => registered }
}

function createStubRoute(postData: unknown, upstreamJson?: unknown): StubRouteResult {
  const result: StubRouteResult = {
    route: undefined as unknown as Route,
    fulfilled: undefined,
    fellBack: false,
    fetchCalled: false,
  }
  const request = { method: () => 'POST', postDataJSON: () => postData }
  result.route = {
    request: () => request,
    fulfill: (opts: { status: number; contentType: string; body: string }) => {
      result.fulfilled = opts
      return Promise.resolve()
    },
    fallback: () => {
      result.fellBack = true
      return Promise.resolve()
    },
    fetch: async () => {
      result.fetchCalled = true
      if (upstreamJson === undefined) throw new Error('no upstream response stubbed for this test')
      return { json: async () => upstreamJson }
    },
  } as unknown as Route
  return result
}

function parsedResult(fulfilled: { body: string } | undefined): unknown {
  return (JSON.parse(fulfilled?.body ?? 'null') as { result: unknown }).result
}

const OWNER = '0x8EB7cc3c5D90D2D6C835245D21622971628bdEB4'
const TOKEN = '0xfff9976782d46cc05630d1f6ebab18b2324d6b14'
const SPENDER = '0x2222222222222222222222222222222222222222'
const CHAIN_ID = 999999
const RPC_URL_ENV = `REACT_APP_NETWORK_URL_${CHAIN_ID}`
const RPC_URL = 'https://rpc.example.test'

function approveCalldata(amount = 5000000n): `0x${string}` {
  return encodeFunctionData({ abi: erc20Abi, functionName: 'approve', args: [SPENDER as Address, amount] })
}

async function setUp(): Promise<{
  receiptHandler: (route: Route) => Promise<void>
  approveSimHandler: (route: Route) => Promise<void>
  sendApproveTx: (amount?: bigint) => Promise<string>
  getApprovedAmount: () => bigint | undefined
  setCalls: Array<[string, number, Record<string, unknown>]>
}> {
  process.env[RPC_URL_ENV] = RPC_URL
  const stubContext = createStubContext()
  const stubs = new Map<string, RpcStub>()
  const wallet = {
    address: OWNER,
    stubRpc: (method: string, fn: unknown) => stubs.set(method, fn as RpcStub),
  } as Pick<MockWalletApi, 'address' | 'stubRpc'>
  const setCalls: Array<[string, number, Record<string, unknown>]> = []
  const allowances = {
    set: (owner: string, chainId: number, values: Record<string, unknown>) => setCalls.push([owner, chainId, values]),
    clear: () => undefined,
    reset: () => undefined,
  } as unknown as AllowancesMock

  const handle = await mockApproveTransaction({
    context: stubContext.context,
    wallet,
    allowances,
    chainId: CHAIN_ID,
    token: TOKEN,
  })

  const handlers = stubContext.getHandlers()
  assert.equal(handlers.length, 2, 'expected a receipt route and an approve-simulation route')
  assert.equal(handlers[0].pattern, RPC_URL, 'the receipt route must stay scoped to rpcUrl')
  assert.equal(handlers[1].pattern, '**/*', 'the approve-simulation route must be host-agnostic')

  return {
    receiptHandler: handlers[0].handler,
    approveSimHandler: handlers[1].handler,
    sendApproveTx: async (amount = 5000000n) => {
      const sendStub = stubs.get('eth_sendTransaction')
      if (!sendStub) throw new Error('eth_sendTransaction was never stubbed')
      return (await sendStub({
        method: 'eth_sendTransaction',
        chainId: CHAIN_ID,
        params: [{ data: approveCalldata(amount) }],
      })) as string
    },
    getApprovedAmount: () => handle.getApprovedAmount(),
    setCalls,
  }
}

test('sending the approve tx decodes spender/amount, updates the allowance mock, and returns the fake hash', async () => {
  const ctx = await setUp()

  const txHash = await ctx.sendApproveTx(123n)

  assert.match(txHash, /^0x(ab)+$/)
  assert.deepEqual(ctx.setCalls, [[OWNER, CHAIN_ID, { [TOKEN]: 123n }]])
  assert.equal(ctx.getApprovedAmount(), 123n)
})

test('the receipt poll reports our own fake hash as mined once sent', async () => {
  const ctx = await setUp()
  const txHash = await ctx.sendApproveTx()

  const route = createStubRoute({ id: 1, method: 'eth_getTransactionReceipt', params: [txHash] })
  await ctx.receiptHandler(route.route)

  const receipt = parsedResult(route.fulfilled) as { transactionHash: string; logs: unknown[] }
  assert.equal(receipt.transactionHash, txHash)
  assert.equal(receipt.logs.length, 1)
})

test('the receipt poll reports not-yet-mined (null) for an unrelated hash, without touching upstream', async () => {
  const ctx = await setUp()

  const route = createStubRoute({ id: 1, method: 'eth_getTransactionReceipt', params: [`0x${'11'.repeat(32)}`] })
  await ctx.receiptHandler(route.route)

  assert.equal(route.fetchCalled, false)
  assert.equal(parsedResult(route.fulfilled), null)
})

test('a batch mixing our receipt poll with an unrelated method merges with upstream', async () => {
  const ctx = await setUp()
  const txHash = await ctx.sendApproveTx()

  const entries = [
    { id: 1, method: 'eth_getTransactionReceipt', params: [txHash] },
    { id: 2, method: 'eth_blockNumber', params: [] },
  ]
  const upstream = [
    { jsonrpc: '2.0', id: 1, result: null },
    { jsonrpc: '2.0', id: 2, result: '0x123' },
  ]
  const route = createStubRoute(entries, upstream)
  await ctx.receiptHandler(route.route)

  assert.equal(route.fetchCalled, true)
  const body = JSON.parse(route.fulfilled?.body ?? 'null') as Array<{ id: number; result: unknown }>
  assert.equal((body[0].result as { transactionHash: string }).transactionHash, txHash)
  assert.equal(body[1].result, '0x123')
})

test('the approve-simulation route answers a call for our own token', async () => {
  const ctx = await setUp()

  const route = createStubRoute({
    id: 1,
    method: 'eth_call',
    params: [{ to: TOKEN, data: approveCalldata() }, 'latest'],
  })
  await ctx.approveSimHandler(route.route)

  assert.equal(parsedResult(route.fulfilled), APPROVE_CALL_SUCCESS_RESULT)
})

test('the approve-simulation route falls back for a different token', async () => {
  const ctx = await setUp()
  const otherToken = '0x0625afb445c3b6b7b929342a04a22599fd5dbb59'

  const route = createStubRoute({
    id: 1,
    method: 'eth_call',
    params: [{ to: otherToken, data: approveCalldata() }, 'latest'],
  })
  await ctx.approveSimHandler(route.route)

  assert.equal(route.fellBack, true)
})

test('throws when REACT_APP_NETWORK_URL_<chainId> is not set', async () => {
  delete process.env[RPC_URL_ENV]
  const stubContext = createStubContext()
  const wallet = { address: OWNER, stubRpc: () => undefined } as Pick<MockWalletApi, 'address' | 'stubRpc'>
  const allowances = {
    set: () => undefined,
    clear: () => undefined,
    reset: () => undefined,
  } as unknown as AllowancesMock

  await assert.rejects(
    () => mockApproveTransaction({ context: stubContext.context, wallet, allowances, chainId: CHAIN_ID, token: TOKEN }),
    new RegExp(RPC_URL_ENV),
  )
})
