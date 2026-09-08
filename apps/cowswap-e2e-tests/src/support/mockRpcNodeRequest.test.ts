import { strict as assert } from 'node:assert'
import { test } from 'node:test'

import { mockRpcNodeRequest } from './mockRpcNodeRequest'

import type { JsonRpcEntry } from './mockRpcNodeRequest'
import type { BrowserContext, Route } from '@playwright/test'

/**
 * `mockRpcNodeRequest` only touches `context.route(pattern, handler)` and, inside the handler,
 * `route.request().{method,postDataJSON}` plus `route.{fulfill,fallback,fetch}`. These stubs cover
 * exactly that surface — same technique as `mocks/cowProtocolApi/install.test.ts` — so the real
 * route handler (matching, batching, upstream merge) runs unmodified against them.
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

function createStubRoute(method: string, postData: unknown, upstreamJson?: unknown): StubRouteResult {
  const result: StubRouteResult = {
    route: undefined as unknown as Route,
    fulfilled: undefined,
    fellBack: false,
    fetchCalled: false,
  }
  const request = {
    method: () => method,
    postDataJSON: () => {
      if (postData === undefined) throw new Error('no post data on this stub request')
      return postData
    },
  }
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

function parsedBody(fulfilled: { body: string } | undefined): unknown {
  return JSON.parse(fulfilled?.body ?? 'null') as unknown
}

const METHOD = 'eth_call'
const alwaysMatches = (): boolean => true

test('a non-POST request falls back untouched', async () => {
  const stub = createStubContext()
  mockRpcNodeRequest(stub.context, METHOD, () => '0x1', alwaysMatches)
  const route = createStubRoute('GET', { id: 1, method: METHOD, params: [] })

  await stub.getHandler()(route.route)

  assert.equal(route.fellBack, true)
  assert.equal(route.fulfilled, undefined)
})

test('a non-JSON body falls back untouched', async () => {
  const stub = createStubContext()
  mockRpcNodeRequest(stub.context, METHOD, () => '0x1', alwaysMatches)
  const route = createStubRoute('POST', undefined)

  await stub.getHandler()(route.route)

  assert.equal(route.fellBack, true)
})

test('an entry that matches() rejects falls back without ever calling resolve', async () => {
  const stub = createStubContext()
  let resolveCalled = false
  mockRpcNodeRequest(
    stub.context,
    METHOD,
    () => {
      resolveCalled = true
      return '0x1'
    },
    () => false,
  )
  const route = createStubRoute('POST', { id: 1, method: METHOD, params: [] })

  await stub.getHandler()(route.route)

  assert.equal(route.fellBack, true)
  assert.equal(resolveCalled, false)
})

test('an entry for a different rpc method falls back untouched', async () => {
  const stub = createStubContext()
  mockRpcNodeRequest(stub.context, METHOD, () => '0x1', alwaysMatches)
  const route = createStubRoute('POST', { id: 1, method: 'eth_blockNumber', params: [] })

  await stub.getHandler()(route.route)

  assert.equal(route.fellBack, true)
})

test('a single matching entry that fully resolves fulfills a single JSON-RPC object, not an array', async () => {
  const stub = createStubContext()
  mockRpcNodeRequest(stub.context, METHOD, (entry) => `resolved-${entry.id}`, alwaysMatches)
  const route = createStubRoute('POST', { id: 7, method: METHOD, params: [] })

  await stub.getHandler()(route.route)

  assert.equal(route.fellBack, false)
  assert.equal(route.fulfilled?.status, 200)
  assert.equal(route.fulfilled?.contentType, 'application/json')
  assert.deepEqual(parsedBody(route.fulfilled), { jsonrpc: '2.0', id: 7, result: 'resolved-7' })
})

test('a batched array body fulfills an array, preserving order and ids', async () => {
  const stub = createStubContext()
  const entries: JsonRpcEntry[] = [
    { id: 1, method: METHOD, params: [] },
    { id: 2, method: METHOD, params: [] },
  ]
  mockRpcNodeRequest(stub.context, METHOD, (entry) => `resolved-${entry.id}`, alwaysMatches)
  const route = createStubRoute('POST', entries)

  await stub.getHandler()(route.route)

  assert.equal(route.fetchCalled, false)
  assert.deepEqual(parsedBody(route.fulfilled), [
    { jsonrpc: '2.0', id: 1, result: 'resolved-1' },
    { jsonrpc: '2.0', id: 2, result: 'resolved-2' },
  ])
})

test('a batch mixing rpc methods goes through upstream, patching only the matched id', async () => {
  const stub = createStubContext()
  const entries: JsonRpcEntry[] = [
    { id: 1, method: METHOD, params: [] },
    { id: 2, method: 'eth_blockNumber', params: [] },
  ]
  const upstream = [
    { jsonrpc: '2.0', id: 1, result: '0xUPSTREAM1' },
    { jsonrpc: '2.0', id: 2, result: '0xUPSTREAM2' },
  ]
  mockRpcNodeRequest(stub.context, METHOD, () => '0xMOCKED', alwaysMatches)
  const route = createStubRoute('POST', entries, upstream)

  await stub.getHandler()(route.route)

  assert.equal(route.fetchCalled, true)
  assert.deepEqual(parsedBody(route.fulfilled), [
    { jsonrpc: '2.0', id: 1, result: '0xMOCKED' },
    { jsonrpc: '2.0', id: 2, result: '0xUPSTREAM2' },
  ])
})

test('resolve() returning undefined for one entry in a same-method batch defers to upstream, then retries with the real upstream result', async () => {
  const stub = createStubContext()
  const entries: JsonRpcEntry[] = [
    { id: 1, method: METHOD, params: [] },
    { id: 2, method: METHOD, params: [] },
  ]
  const upstream = [
    { jsonrpc: '2.0', id: 1, result: '0xUPSTREAM1' },
    { jsonrpc: '2.0', id: 2, result: '0xUPSTREAM2' },
  ]

  // Entry 2 only knows how to answer once it has seen the real upstream result — the same shape
  // `mockContractViewCall`'s aggregate3 "some calls matched, some didn't" case needs.
  mockRpcNodeRequest(
    stub.context,
    METHOD,
    (entry, upstreamResult) => {
      if (entry.id === 2 && upstreamResult === undefined) return undefined
      return `mocked-${entry.id}`
    },
    alwaysMatches,
  )
  const route = createStubRoute('POST', entries, upstream)

  await stub.getHandler()(route.route)

  assert.equal(route.fetchCalled, true)
  assert.deepEqual(parsedBody(route.fulfilled), [
    { jsonrpc: '2.0', id: 1, result: 'mocked-1' },
    { jsonrpc: '2.0', id: 2, result: 'mocked-2' },
  ])
})

test('an upstream fetch failure falls back untouched instead of throwing', async () => {
  const stub = createStubContext()
  const entries: JsonRpcEntry[] = [
    { id: 1, method: METHOD, params: [] },
    { id: 2, method: 'eth_blockNumber', params: [] },
  ]
  mockRpcNodeRequest(stub.context, METHOD, () => '0xMOCKED', alwaysMatches)
  // No upstreamJson passed -> the stub's fetch() throws, exercising fulfillFromUpstream's catch.
  const route = createStubRoute('POST', entries)

  await stub.getHandler()(route.route)

  assert.equal(route.fetchCalled, true)
  assert.equal(route.fellBack, true)
  assert.equal(route.fulfilled, undefined)
})
