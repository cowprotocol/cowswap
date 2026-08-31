import { encodeFunctionData, erc20Abi, type Address } from 'viem'

import { strict as assert } from 'node:assert'
import { test } from 'node:test'

import { mockApproveSimulation } from './mockApproveSimulation'
import { APPROVE_CALL_SUCCESS_RESULT } from './mockApproveTransaction'

import type { BrowserContext, Route } from '@playwright/test'

/**
 * `mockApproveSimulation` only touches `context.route(pattern, handler)` and, inside the handler
 * (via `mockRpcNodeRequest`), `route.request().{method,postDataJSON}` plus
 * `route.{fulfill,fallback,fetch}` — same stub surface as `mockRpcNodeRequest.test.ts`.
 */

interface StubRouteResult {
  route: Route
  fulfilled: { status: number; contentType: string; body: string } | undefined
  fellBack: boolean
  fetchCalled: boolean
}

function createStubContext(): { context: BrowserContext; getHandler: () => (route: Route) => Promise<void> } {
  let captured: ((route: Route) => Promise<void>) | undefined
  const context = {
    route: (_pattern: unknown, handlerFn: (route: Route) => Promise<void>) => {
      captured = handlerFn
      return Promise.resolve()
    },
  } as unknown as BrowserContext
  return {
    context,
    getHandler: () => {
      if (!captured) throw new Error('context.route was never registered')
      return captured
    },
  }
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

const TOKEN = '0xfff9976782d46cc05630d1f6ebab18b2324d6b14'
const SPENDER = '0x2222222222222222222222222222222222222222'

function approveCalldata(): `0x${string}` {
  return encodeFunctionData({
    abi: erc20Abi,
    functionName: 'approve',
    args: [SPENDER as Address, 5000000n],
  })
}

test('an approve() simulation call resolves to a successful bool, regardless of token/spender', async () => {
  const stub = createStubContext()
  mockApproveSimulation(stub.context)
  const route = createStubRoute({
    id: 1,
    method: 'eth_call',
    params: [{ to: TOKEN, data: approveCalldata() }, 'latest'],
  })

  await stub.getHandler()(route.route)

  assert.equal(route.fetchCalled, false)
  assert.equal(parsedResult(route.fulfilled), APPROVE_CALL_SUCCESS_RESULT)
})

test('a non-approve eth_call falls back untouched', async () => {
  const stub = createStubContext()
  mockApproveSimulation(stub.context)
  const balanceOfCalldata = encodeFunctionData({ abi: erc20Abi, functionName: 'balanceOf', args: [SPENDER as Address] })
  const route = createStubRoute({
    id: 1,
    method: 'eth_call',
    params: [{ to: TOKEN, data: balanceOfCalldata }, 'latest'],
  })

  await stub.getHandler()(route.route)

  assert.equal(route.fellBack, true)
})

test('a batch mixing an approve() call with an unrelated one merges with upstream, patching only the approve slot', async () => {
  const stub = createStubContext()
  mockApproveSimulation(stub.context)
  const entries = [
    { id: 1, method: 'eth_call', params: [{ to: TOKEN, data: approveCalldata() }, 'latest'] },
    { id: 2, method: 'eth_blockNumber', params: [] },
  ]
  const upstream = [
    { jsonrpc: '2.0', id: 1, result: '0xREAL_APPROVE_RESULT' },
    { jsonrpc: '2.0', id: 2, result: '0x123' },
  ]
  const route = createStubRoute(entries, upstream)

  await stub.getHandler()(route.route)

  assert.equal(route.fetchCalled, true)
  assert.deepEqual(JSON.parse(route.fulfilled?.body ?? 'null'), [
    { jsonrpc: '2.0', id: 1, result: APPROVE_CALL_SUCCESS_RESULT },
    { jsonrpc: '2.0', id: 2, result: '0x123' },
  ])
})
