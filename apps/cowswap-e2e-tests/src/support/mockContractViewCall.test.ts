import { decodeAbiParameters, encodeAbiParameters, encodeFunctionData, erc20Abi, toFunctionSelector } from 'viem'
import type { Address, Hex } from 'viem'

import { strict as assert } from 'node:assert'
import { test } from 'node:test'

import { mockContractViewCall } from './mockContractViewCall'

import { installBalances } from '../mocks/balances'

import type { BrowserContext, Route } from '@playwright/test'

/**
 * `mockContractViewCall` only touches `context.route(pattern, handler)` and, inside the handler
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
  const request = {
    method: () => 'POST',
    postDataJSON: () => postData,
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

function parsedBody(fulfilled: { body: string } | undefined): { jsonrpc: string; id: number; result: Hex } {
  return JSON.parse(fulfilled?.body ?? 'null') as { jsonrpc: string; id: number; result: Hex }
}

const MULTICALL3 = '0xcA11bde05977b3631167028862bE2a173976CA11'
const AGGREGATE3_SELECTOR = '0x82ad56cb'

const CALL3_TUPLE = [
  {
    type: 'tuple[]',
    components: [
      { name: 'target', type: 'address' },
      { name: 'allowFailure', type: 'bool' },
      { name: 'callData', type: 'bytes' },
    ],
  },
] as const

const RESULT_TUPLE = [
  {
    type: 'tuple[]',
    components: [
      { name: 'success', type: 'bool' },
      { name: 'returnData', type: 'bytes' },
    ],
  },
] as const

function aggregate3Calldata(calls: Array<{ target: string; callData: Hex }>): Hex {
  const encoded = encodeAbiParameters(CALL3_TUPLE, [
    calls.map((c) => ({ target: c.target as Address, allowFailure: true, callData: c.callData })),
  ])
  return `${AGGREGATE3_SELECTOR}${encoded.slice(2)}` as Hex
}

function decodeAggregate3Result(blob: Hex): ReadonlyArray<{ success: boolean; returnData: Hex }> {
  return decodeAbiParameters(RESULT_TUPLE, blob)[0] as ReadonlyArray<{ success: boolean; returnData: Hex }>
}

const TOKEN_A = '0xfff9976782d46cc05630d1f6ebab18b2324d6b14'
const OWNER = '0x1111111111111111111111111111111111111111'
const SPENDER = '0x2222222222222222222222222222222222222222'

function allowanceCalldata(): Hex {
  return encodeFunctionData({ abi: erc20Abi, functionName: 'allowance', args: [OWNER as Address, SPENDER as Address] })
}

function balanceOfCalldata(): Hex {
  return encodeFunctionData({ abi: erc20Abi, functionName: 'balanceOf', args: [OWNER as Address] })
}

const ALLOWANCE_SELECTOR = toFunctionSelector('allowance(address,address)')

test('a direct call matching contract address and selector resolves locally', async () => {
  const stub = createStubContext()
  mockContractViewCall(stub.context, TOKEN_A, ALLOWANCE_SELECTOR, (callData, target) => {
    assert.equal(callData, allowanceCalldata())
    assert.equal(target.toLowerCase(), TOKEN_A.toLowerCase())
    return '0xdeadbeef'
  })
  const route = createStubRoute({
    id: 1,
    method: 'eth_call',
    params: [{ to: TOKEN_A, data: allowanceCalldata() }, 'latest'],
  })

  await stub.getHandler()(route.route)

  assert.equal(route.fellBack, false)
  assert.equal(parsedBody(route.fulfilled).result, '0xdeadbeef')
})

test('a direct call to a different contract address falls back untouched', async () => {
  const stub = createStubContext()
  mockContractViewCall(stub.context, TOKEN_A, ALLOWANCE_SELECTOR, () => '0xdeadbeef')
  const otherToken = '0x0625afb445c3b6b7b929342a04a22599fd5dbb59'
  const route = createStubRoute({
    id: 1,
    method: 'eth_call',
    params: [{ to: otherToken, data: allowanceCalldata() }, 'latest'],
  })

  await stub.getHandler()(route.route)

  assert.equal(route.fellBack, true)
})

test('a direct call matches any target when no contract address is given', async () => {
  const stub = createStubContext()
  mockContractViewCall(stub.context, undefined, ALLOWANCE_SELECTOR, () => '0xdeadbeef')
  const route = createStubRoute({
    id: 1,
    method: 'eth_call',
    params: [{ to: TOKEN_A, data: allowanceCalldata() }, 'latest'],
  })

  await stub.getHandler()(route.route)

  assert.equal(route.fellBack, false)
  assert.equal(parsedBody(route.fulfilled).result, '0xdeadbeef')
})

test('a call whose selector does not match falls back untouched', async () => {
  const stub = createStubContext()
  mockContractViewCall(stub.context, TOKEN_A, ALLOWANCE_SELECTOR, () => '0xdeadbeef')
  const route = createStubRoute({
    id: 1,
    method: 'eth_call',
    params: [{ to: TOKEN_A, data: balanceOfCalldata() }, 'latest'],
  })

  await stub.getHandler()(route.route)

  assert.equal(route.fellBack, true)
})

test('a real captured aggregate3 batch (SocketVerifier.validateRotueId, single call) resolves locally without an upstream fetch', async () => {
  const SOCKET_VERIFIER_ADDRESS = '0xa27a3f5a96df7d8be26ee2790999860c00eb688d'
  const VALIDATE_ROTUE_ID_SELECTOR = toFunctionSelector('validateRotueId(bytes,uint32)')

  // Captured verbatim from a real page load (bug report): a single `validateRotueId` call for
  // SocketVerifier, batched inside one `aggregate3`, sent as `eth_call` id 20.
  const capturedEntry = {
    jsonrpc: '2.0',
    id: 20,
    method: 'eth_call',
    params: [
      {
        to: '0xca11bde05977b3631167028862be2a173976ca11',
        data: '0x82ad56cb000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000a27a3f5a96df7d8be26ee2790999860c00eb688d0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a4eee54b0d00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002800000001cc54d224000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      },
      'latest',
    ],
  }
  const outerCall = capturedEntry.params[0] as { to: string; data: string }
  assert.ok(
    outerCall.data.includes(VALIDATE_ROTUE_ID_SELECTOR.slice(2)),
    'fixture must actually carry the selector under test',
  )

  const EMPTY_BYTES = '0x' as Hex
  const stub = createStubContext()
  mockContractViewCall(stub.context, SOCKET_VERIFIER_ADDRESS, VALIDATE_ROTUE_ID_SELECTOR, () => EMPTY_BYTES)
  const route = createStubRoute(capturedEntry)

  await stub.getHandler()(route.route)

  assert.equal(route.fetchCalled, false, 'a fully-matched single-call batch must never touch the real node')
  assert.equal(route.fellBack, false)
  const results = decodeAggregate3Result(parsedBody(route.fulfilled).result)
  assert.equal(results.length, 1)
  assert.equal(results[0].success, true)
  assert.equal(results[0].returnData, EMPTY_BYTES)
})

test('an aggregate3 batch mixing a matching and a non-matching call merges with upstream, patching only the matched slot', async () => {
  const data = aggregate3Calldata([
    { target: TOKEN_A, callData: allowanceCalldata() },
    { target: TOKEN_A, callData: balanceOfCalldata() },
  ])
  const stub = createStubContext()
  mockContractViewCall(
    stub.context,
    TOKEN_A,
    ALLOWANCE_SELECTOR,
    () => '0x000000000000000000000000000000000000000000000000000000000000002a',
  )

  const upstreamBalance = '0x0000000000000000000000000000000000000000000000000000000000000009'
  const upstream = {
    jsonrpc: '2.0',
    id: 5,
    result: encodeAbiParameters(RESULT_TUPLE, [
      [
        { success: true, returnData: '0x00000000000000000000000000000000000000000000000000000000000000ff' as Hex },
        { success: true, returnData: upstreamBalance as Hex },
      ],
    ]),
  }
  const route = createStubRoute({ id: 5, method: 'eth_call', params: [{ to: MULTICALL3, data }, 'latest'] }, upstream)

  await stub.getHandler()(route.route)

  assert.equal(route.fetchCalled, true)
  const results = decodeAggregate3Result(parsedBody(route.fulfilled).result)
  assert.equal(results.length, 2)
  assert.equal(results[0].success, true)
  assert.equal(decodeAbiParameters([{ type: 'uint256' }], results[0].returnData)[0], 42n)
  assert.equal(results[1].returnData, upstreamBalance)
})

// Real-world shape (bug report): the SDK's own `validateSocketRequest` call happens to land in the
// same batch as a coincidental native-balance poll, purely by viem's incidental request batching —
// the two calls are otherwise unrelated.
const SOCKET_VERIFIER_ADDRESS = '0xa27a3f5a96df7d8be26ee2790999860c00eb688d'
const VALIDATE_SOCKET_REQUEST_SELECTOR = toFunctionSelector(
  'validateSocketRequest(bytes,(uint32,(uint256,address,uint256,address,bytes4)))',
)
const GET_ETH_BALANCE_SELECTOR = '0x4d2301cc'
const SOCKET_VERIFIER_EMPTY_BYTES = '0x' as Hex
// Same pseudo-address `mockContractViewCall.ts`/`cross-chain-swaps.spec.ts` use for a wallet's
// native ETH balance inside `mocks/balances`.
const NATIVE_ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'

function installSocketVerifierStub(context: BrowserContext): void {
  mockContractViewCall(
    context,
    SOCKET_VERIFIER_ADDRESS,
    VALIDATE_SOCKET_REQUEST_SELECTOR,
    () => SOCKET_VERIFIER_EMPTY_BYTES,
  )
}

function socketVerifierBatchCalldata(balanceOwner: string): Hex {
  return aggregate3Calldata([
    { target: SOCKET_VERIFIER_ADDRESS, callData: `${VALIDATE_SOCKET_REQUEST_SELECTOR}deadbeef` as Hex },
    {
      target: MULTICALL3,
      callData: `${GET_ETH_BALANCE_SELECTOR}${'0'.repeat(24)}${balanceOwner.slice(2)}` as Hex,
    },
  ])
}

test('an aggregate3 batch mixing a matching call with getEthBalance resolves locally to the fallback balance when mocks/balances has nothing set', async () => {
  const owner = '0x8eb7cc3c5d90d2d6c835245d21622971628bdeb4'
  const data = socketVerifierBatchCalldata(owner)

  const stub = createStubContext()
  installBalances(stub.context)
  installSocketVerifierStub(stub.context)
  const route = createStubRoute({ id: 1, method: 'eth_call', params: [{ to: MULTICALL3, data }, 'latest'] })

  await stub.getHandler()(route.route)

  assert.equal(route.fetchCalled, false, 'must never need a live upstream fetch to fill the getEthBalance slot')
  assert.equal(route.fellBack, false)
  const results = decodeAggregate3Result(parsedBody(route.fulfilled).result)
  assert.equal(results.length, 2)
  assert.equal(results[0].success, true)
  assert.equal(results[0].returnData, SOCKET_VERIFIER_EMPTY_BYTES)
  assert.equal(results[1].success, true)
  assert.equal(decodeAbiParameters([{ type: 'uint256' }], results[1].returnData)[0], 10n ** 18n)
})

test('an aggregate3 batch mixing a matching call with getEthBalance uses mocks/balances state, not the fallback', async () => {
  const owner = '0x8eb7cc3c5d90d2d6c835245d21622971628bdeb4'
  const data = socketVerifierBatchCalldata(owner)

  const stub = createStubContext()
  const balances = installBalances(stub.context)
  balances.set(owner, 1, { [NATIVE_ETH_ADDRESS]: 7n })
  installSocketVerifierStub(stub.context)
  const route = createStubRoute({ id: 1, method: 'eth_call', params: [{ to: MULTICALL3, data }, 'latest'] })

  await stub.getHandler()(route.route)

  assert.equal(route.fetchCalled, false)
  const results = decodeAggregate3Result(parsedBody(route.fulfilled).result)
  assert.equal(decodeAbiParameters([{ type: 'uint256' }], results[1].returnData)[0], 7n)
})

test("an aggregate3 batch mixing a matching call with getEthBalance for a different owner still uses that owner's own mocks/balances state", async () => {
  const owner = '0x8eb7cc3c5d90d2d6c835245d21622971628bdeb4'
  const otherOwner = '0x9999999999999999999999999999999999999999'
  const data = socketVerifierBatchCalldata(owner)

  const stub = createStubContext()
  const balances = installBalances(stub.context)
  balances.set(otherOwner, 1, { [NATIVE_ETH_ADDRESS]: 7n })
  installSocketVerifierStub(stub.context)
  const route = createStubRoute({ id: 1, method: 'eth_call', params: [{ to: MULTICALL3, data }, 'latest'] })

  await stub.getHandler()(route.route)

  const results = decodeAggregate3Result(parsedBody(route.fulfilled).result)
  assert.equal(decodeAbiParameters([{ type: 'uint256' }], results[1].returnData)[0], 10n ** 18n)
})

function bareGetEthBalanceCalldata(owner: string): Hex {
  return `${GET_ETH_BALANCE_SELECTOR}${'0'.repeat(24)}${owner.slice(2)}` as Hex
}

test('a bare, non-batched getEthBalance call resolves to the fallback balance when mocks/balances has nothing set', async () => {
  const owner = '0x8eb7cc3c5d90d2d6c835245d21622971628bdeb4'
  const stub = createStubContext()
  installBalances(stub.context)
  installSocketVerifierStub(stub.context)
  const route = createStubRoute({
    id: 1,
    method: 'eth_call',
    params: [{ to: MULTICALL3, data: bareGetEthBalanceCalldata(owner) }, 'latest'],
  })

  await stub.getHandler()(route.route)

  assert.equal(route.fellBack, false)
  assert.equal(route.fetchCalled, false)
  assert.equal(decodeAbiParameters([{ type: 'uint256' }], parsedBody(route.fulfilled).result)[0], 10n ** 18n)
})

test('a bare, non-batched getEthBalance call resolves via mocks/balances state, no upstream fetch', async () => {
  const owner = '0x8eb7cc3c5d90d2d6c835245d21622971628bdeb4'
  const stub = createStubContext()
  const balances = installBalances(stub.context)
  balances.set(owner, 1, { [NATIVE_ETH_ADDRESS]: 123n })
  installSocketVerifierStub(stub.context)
  const route = createStubRoute({
    id: 1,
    method: 'eth_call',
    params: [{ to: MULTICALL3, data: bareGetEthBalanceCalldata(owner) }, 'latest'],
  })

  await stub.getHandler()(route.route)

  assert.equal(route.fellBack, false)
  assert.equal(route.fetchCalled, false)
  assert.equal(decodeAbiParameters([{ type: 'uint256' }], parsedBody(route.fulfilled).result)[0], 123n)
})

const GET_CURRENT_BLOCK_TIMESTAMP_SELECTOR = '0x0f28c97d'

function bareGetCurrentBlockTimestampCalldata(): Hex {
  return GET_CURRENT_BLOCK_TIMESTAMP_SELECTOR as Hex
}

test('a bare, non-batched getCurrentBlockTimestamp call resolves locally to a plausible timestamp, no upstream fetch', async () => {
  const stub = createStubContext()
  installSocketVerifierStub(stub.context)
  const route = createStubRoute({
    id: 1,
    method: 'eth_call',
    params: [{ to: MULTICALL3, data: bareGetCurrentBlockTimestampCalldata() }, 'latest'],
  })

  const before = BigInt(Math.floor(Date.now() / 1000))
  await stub.getHandler()(route.route)
  const after = BigInt(Math.floor(Date.now() / 1000))

  assert.equal(route.fellBack, false)
  assert.equal(route.fetchCalled, false)
  const timestamp = decodeAbiParameters([{ type: 'uint256' }], parsedBody(route.fulfilled).result)[0]
  assert.ok(timestamp >= before && timestamp <= after, `expected ${timestamp} to be near ${before}`)
})

test('an aggregate3 batch mixing a matching call with getCurrentBlockTimestamp resolves locally, no upstream fetch', async () => {
  const data = aggregate3Calldata([
    { target: SOCKET_VERIFIER_ADDRESS, callData: `${VALIDATE_SOCKET_REQUEST_SELECTOR}deadbeef` as Hex },
    { target: MULTICALL3, callData: bareGetCurrentBlockTimestampCalldata() },
  ])
  const stub = createStubContext()
  installSocketVerifierStub(stub.context)
  const route = createStubRoute({ id: 1, method: 'eth_call', params: [{ to: MULTICALL3, data }, 'latest'] })

  await stub.getHandler()(route.route)

  assert.equal(route.fetchCalled, false)
  const results = decodeAggregate3Result(parsedBody(route.fulfilled).result)
  assert.equal(results.length, 2)
  assert.equal(results[0].returnData, SOCKET_VERIFIER_EMPTY_BYTES)
  const timestamp = decodeAbiParameters([{ type: 'uint256' }], results[1].returnData)[0]
  assert.ok(timestamp > 0n)
})

test('an aggregate3 batch with no matching call at all falls back untouched', async () => {
  const data = aggregate3Calldata([{ target: TOKEN_A, callData: balanceOfCalldata() }])
  const stub = createStubContext()
  mockContractViewCall(stub.context, TOKEN_A, ALLOWANCE_SELECTOR, () => '0xdeadbeef')
  const route = createStubRoute({ id: 1, method: 'eth_call', params: [{ to: MULTICALL3, data }, 'latest'] })

  await stub.getHandler()(route.route)

  assert.equal(route.fellBack, true)
  assert.equal(route.fetchCalled, false)
})
