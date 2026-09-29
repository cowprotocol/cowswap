import { decodeAbiParameters, encodeAbiParameters, encodeFunctionData, erc20Abi, type Address, type Hex } from 'viem'

import { areAddressesEqual } from '@cowprotocol/cow-sdk'

import { strict as assert } from 'node:assert'
import { test } from 'node:test'

import {
  classifyEthCall,
  installNativeBalanceRoute,
  isFullyMocked,
  isFullyOpaqueCall,
  resolveEthBalanceBatch,
  type BatchCall,
} from './mockEthFlowTransaction'
import { registerNestedCallResolver } from './nestedRpcCallRegistry'

import type { BrowserContext, Route } from '@playwright/test'

/**
 * `installNativeBalanceRoute` only touches `context.route(pattern, handler)` and, inside the
 * handler (via `mockRpcNodeRequest`), `route.request().{method,postDataJSON}` plus
 * `route.{fulfill,fallback,fetch}` — same stub surface as `mockRpcNodeRequest.test.ts`.
 */

interface StubRouteResult {
  route: Route
  fulfilled: { status: number; contentType: string; body: string } | undefined
  fellBack: boolean
  fetchCalled: boolean
}

function createStubContext(): {
  context: BrowserContext
  getPattern: () => unknown
  getHandler: () => (route: Route) => Promise<void>
} {
  let pattern: unknown
  let captured: ((route: Route) => Promise<void>) | undefined
  const context = {
    route: (p: unknown, handlerFn: (route: Route) => Promise<void>) => {
      pattern = p
      captured = handlerFn
      return Promise.resolve()
    },
  } as unknown as BrowserContext
  return {
    context,
    getPattern: () => pattern,
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

function parsedResult(fulfilled: { body: string } | undefined): Hex {
  return (JSON.parse(fulfilled?.body ?? 'null') as { result: Hex }).result
}

const MULTICALL3 = '0xcA11bde05977b3631167028862bE2a173976CA11'
const AGGREGATE3_SELECTOR = '0x82ad56cb'
const GET_ETH_BALANCE_SELECTOR = '0x4d2301cc'
const OWNER = '0x8EB7cc3c5D90D2D6C835245D21622971628bdEB4'
const OTHER_ADDRESS = '0x1111111111111111111111111111111111111111'
const TX_HASH = `0x${'ef'.repeat(32)}` as Hex

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

function getEthBalanceCalldata(address: string): Hex {
  return `${GET_ETH_BALANCE_SELECTOR}${encodeAbiParameters([{ type: 'address' }], [address as Address]).slice(2)}` as Hex
}

/** An arbitrary, unrelated `eth_call` this route should never claim to understand. */
function opaqueCalldata(): Hex {
  return encodeFunctionData({
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [OWNER as Address],
  })
}

/** Registers a fake "different, unrelated mock" resolver for testing purposes — proves
 * `isFullyMocked`/`resolveEthBalanceBatch` correctly consult `nestedRpcCallRegistry.ts` for a slot
 * this route doesn't itself recognize, without depending on any real mock (e.g.
 * `installSocketVerifier`) to prove the mechanism — see `nestedRpcCallRegistry.test.ts` for that
 * real, cross-mock composition. */
function registerFakeOtherMock(context: BrowserContext, target: string, matchCallData: Hex, answer: Hex): void {
  registerNestedCallResolver(context, (t, callData) =>
    areAddressesEqual(t, target) && callData === matchCallData ? answer : undefined,
  )
}

// --- classifyEthCall / isFullyMocked / isFullyOpaqueCall -------------------------------------

test('classifyEthCall recognizes a direct getEthBalance(owner) call', () => {
  assert.deepEqual(classifyEthCall(getEthBalanceCalldata(OWNER), OWNER, MULTICALL3), { kind: 'ownBalance' })
})

test('classifyEthCall treats getEthBalance for a different address as opaque, carrying its target+callData', () => {
  const data = getEthBalanceCalldata(OTHER_ADDRESS)
  assert.deepEqual(classifyEthCall(data, OWNER, MULTICALL3), { kind: 'opaque', target: MULTICALL3, callData: data })
})

test('classifyEthCall treats an unrelated selector as opaque, carrying its target+callData', () => {
  const data = opaqueCalldata()
  assert.deepEqual(classifyEthCall(data, OWNER, OTHER_ADDRESS), {
    kind: 'opaque',
    target: OTHER_ADDRESS,
    callData: data,
  })
})

test('classifyEthCall recognizes getEthBalance nested inside an aggregate3 batch', () => {
  const data = aggregate3Calldata([{ target: MULTICALL3, callData: getEthBalanceCalldata(OWNER) }])
  const call = classifyEthCall(data, OWNER, MULTICALL3) as BatchCall

  assert.equal(call.kind, 'batch')
  assert.deepEqual(call.calls, [{ kind: 'ownBalance' }])
})

test('isFullyMocked is true once every leaf is ownBalance, or something a different, unrelated mock recognizes', () => {
  const context = createStubContext().context
  const knownOtherCall = opaqueCalldata()
  registerFakeOtherMock(context, MULTICALL3, knownOtherCall, '0xdeadbeef' as Hex)

  const allBalance = classifyEthCall(
    aggregate3Calldata([
      { target: MULTICALL3, callData: getEthBalanceCalldata(OWNER) },
      { target: MULTICALL3, callData: getEthBalanceCalldata(OWNER) },
    ]),
    OWNER,
    MULTICALL3,
  )
  // Same calldata bytes as the registered fake, but a different target — the fake resolver checks
  // both, so this must NOT be recognized.
  const unrecognizedMixed = classifyEthCall(
    aggregate3Calldata([
      { target: MULTICALL3, callData: getEthBalanceCalldata(OWNER) },
      { target: OTHER_ADDRESS, callData: knownOtherCall },
    ]),
    OWNER,
    MULTICALL3,
  )
  const balancePlusKnownOther = classifyEthCall(
    aggregate3Calldata([
      { target: MULTICALL3, callData: getEthBalanceCalldata(OWNER) },
      { target: MULTICALL3, callData: knownOtherCall },
    ]),
    OWNER,
    MULTICALL3,
  )

  assert.equal(isFullyMocked(context, allBalance), true)
  assert.equal(isFullyMocked(context, unrecognizedMixed), false)
  assert.equal(isFullyMocked(context, balancePlusKnownOther), true)
  assert.equal(isFullyMocked(context, { kind: 'opaque', target: OTHER_ADDRESS, callData: opaqueCalldata() }), false)
})

test('isFullyOpaqueCall is true for a batch whose every call is opaque, even though the batch itself is not "opaque"-kind', () => {
  // A batch that's *nothing but* an unrelated call, unrecognized by this route at all — the same
  // shape a real bug hit: an aggregate3 wrapping a single unrelated on-chain check (e.g.
  // SocketVerifier's `validateRotueId`) with no `getEthBalance` alongside it. `isFullyOpaqueCall`
  // deliberately never consults `nestedRpcCallRegistry.ts` (see its own doc comment) — even though
  // some other mock might recognize this call, a batch with none of *this* route's own concern in
  // it is none of its business, so it must defer the whole thing via `route.fallback()` instead of
  // claiming it just because it happens to be *able* to answer it.
  const opaqueShaped = classifyEthCall(
    aggregate3Calldata([{ target: MULTICALL3, callData: opaqueCalldata() }]),
    OWNER,
    MULTICALL3,
  )

  assert.equal(opaqueShaped.kind, 'batch')
  assert.equal(isFullyOpaqueCall(opaqueShaped), true)
})

test('isFullyOpaqueCall is false as soon as one leaf is ownBalance, and false for a mixed batch too', () => {
  const pureBalance = classifyEthCall(getEthBalanceCalldata(OWNER), OWNER, MULTICALL3)
  const mixed = classifyEthCall(
    aggregate3Calldata([
      { target: MULTICALL3, callData: getEthBalanceCalldata(OWNER) },
      { target: MULTICALL3, callData: opaqueCalldata() },
    ]),
    OWNER,
    MULTICALL3,
  )

  assert.equal(isFullyOpaqueCall(pureBalance), false)
  assert.equal(isFullyOpaqueCall(mixed), false)
})

test('resolveEthBalanceBatch patches the ownBalance slot and preserves the real upstream slot for something nothing recognizes', () => {
  const context = createStubContext().context
  const call = classifyEthCall(
    aggregate3Calldata([
      { target: MULTICALL3, callData: getEthBalanceCalldata(OWNER) },
      { target: MULTICALL3, callData: opaqueCalldata() },
    ]),
    OWNER,
    MULTICALL3,
  ) as BatchCall

  const upstream = encodeAbiParameters(RESULT_TUPLE, [
    [
      { success: true, returnData: '0x00' as Hex },
      { success: true, returnData: '0x000000000000000000000000000000000000000000000000000000000000002a' as Hex },
    ],
  ])

  const results = decodeAggregate3Result(resolveEthBalanceBatch(context, call, 777n, upstream))
  assert.equal(decodeAbiParameters([{ type: 'uint256' }], results[0].returnData)[0], 777n)
  assert.equal(results[1].returnData, '0x000000000000000000000000000000000000000000000000000000000000002a')
})

test('resolveEthBalanceBatch patches a slot a different, unrelated mock recognizes instead of relaying a real revert for it', () => {
  // This is the actual shape of the CS-297 bug: the owner's own `getEthBalance` batched alongside
  // an unrelated on-chain check that, for real, reverts. Before this fix, this route had no way to
  // find out anything besides "the real upstream said X" for a slot it didn't itself recognize —
  // now it asks around first (`nestedRpcCallRegistry.ts`) and only relays the real answer once
  // nothing else claims it either.
  const context = createStubContext().context
  const knownOtherCall = opaqueCalldata()
  registerFakeOtherMock(context, MULTICALL3, knownOtherCall, '0xdeadbeef' as Hex)

  const call = classifyEthCall(
    aggregate3Calldata([
      { target: MULTICALL3, callData: getEthBalanceCalldata(OWNER) },
      { target: MULTICALL3, callData: knownOtherCall },
    ]),
    OWNER,
    MULTICALL3,
  ) as BatchCall

  const upstream = encodeAbiParameters(RESULT_TUPLE, [
    [
      { success: true, returnData: '0x00' as Hex },
      { success: false, returnData: '0xdeaddead' as Hex }, // a real revert — must never surface below.
    ],
  ])

  const results = decodeAggregate3Result(resolveEthBalanceBatch(context, call, 777n, upstream))
  assert.equal(decodeAbiParameters([{ type: 'uint256' }], results[0].returnData)[0], 777n)
  assert.equal(results[1].success, true)
  assert.equal(results[1].returnData, '0xdeadbeef')
})

// --- installNativeBalanceRoute (integration, via mockRpcNodeRequest) -------------------------

function install(overrides: Partial<{ getBalance: () => bigint; isMined: () => boolean }> = {}): {
  context: ReturnType<typeof createStubContext>['context']
  getPattern: () => unknown
  getHandler: () => (route: Route) => Promise<void>
} {
  const stub = createStubContext()
  installNativeBalanceRoute({
    context: stub.context,
    owner: OWNER,
    txHash: TX_HASH,
    getBalance: overrides.getBalance ?? (() => 0n),
    isMined: overrides.isMined ?? (() => false),
  })
  return stub
}

test('registers host-agnostically', () => {
  const stub = install()
  assert.equal(stub.getPattern(), '**/*')
})

test('a real captured aggregate3 batch (SocketVerifier.validateRotueId, single call) falls back untouched, never fetching upstream', async () => {
  // Captured verbatim from a real page load (bug report): a single, unrelated `validateRotueId`
  // call for SocketVerifier, batched inside one `aggregate3`, sent as `eth_call` id 20 to this
  // exact RPC host. Before the `isFullyOpaqueCall` fix this route swallowed it, fetched the real
  // upstream, and relayed a real on-chain revert straight to the app.
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
  const stub = install()
  const route = createStubRoute(capturedEntry)

  await stub.getHandler()(route.route)

  assert.equal(route.fetchCalled, false)
  assert.equal(route.fellBack, true)
  assert.equal(route.fulfilled, undefined)
})

test('a batch mixing ownBalance with a call a different, unrelated mock recognizes resolves both slots locally, no real upstream leaked', async () => {
  // Same shape as the CS-297 CI failure: the owner's own `getEthBalance` batched alongside an
  // unrelated on-chain check (there, SocketVerifier's `validateRotueId`) that, for real, reverts —
  // expressed generically here via `registerFakeOtherMock` rather than a real SocketVerifier call;
  // see `nestedRpcCallRegistry.test.ts` for the real, cross-mock composition with
  // `installSocketVerifier`.
  const owner = OWNER
  const stub = createStubContext()
  const knownOtherCall = opaqueCalldata()
  registerFakeOtherMock(stub.context, MULTICALL3, knownOtherCall, '0xdeadbeef' as Hex)
  installNativeBalanceRoute({
    context: stub.context,
    owner,
    txHash: TX_HASH,
    getBalance: () => 10n ** 18n,
    isMined: () => false,
  })
  const data = aggregate3Calldata([
    { target: MULTICALL3, callData: getEthBalanceCalldata(owner) },
    { target: MULTICALL3, callData: knownOtherCall },
  ])
  const upstream = {
    jsonrpc: '2.0',
    id: 7,
    result: encodeAbiParameters(RESULT_TUPLE, [
      [
        { success: true, returnData: '0x00' as Hex },
        { success: false, returnData: '0xdeaddead' as Hex }, // a real revert — must never surface below.
      ],
    ]),
  }
  const route = createStubRoute({ id: 7, method: 'eth_call', params: [{ to: MULTICALL3, data }, 'latest'] }, upstream)

  await stub.getHandler()(route.route)

  assert.equal(route.fellBack, false, 'must claim the batch for its own ownBalance slot')
  assert.equal(route.fetchCalled, false, 'both slots are locally answerable, no real RPC round-trip needed')
  const results = decodeAggregate3Result(parsedResult(route.fulfilled))
  assert.equal(results.length, 2)
  assert.equal(decodeAbiParameters([{ type: 'uint256' }], results[0].returnData)[0], 10n ** 18n)
  assert.equal(results[1].success, true, 'must not be the real revert')
  assert.equal(results[1].returnData, '0xdeadbeef')
})

test('a pure ownBalance call resolves locally to the mocked balance, without touching upstream', async () => {
  const stub = install({ getBalance: () => 123n })
  const route = createStubRoute({
    id: 1,
    method: 'eth_call',
    params: [{ to: MULTICALL3, data: getEthBalanceCalldata(OWNER) }, 'latest'],
  })

  await stub.getHandler()(route.route)

  assert.equal(route.fetchCalled, false)
  assert.equal(decodeAbiParameters([{ type: 'uint256' }], parsedResult(route.fulfilled))[0], 123n)
})

test('a mixed batch (ownBalance + unrelated call) merges with upstream, patching only the ownBalance slot', async () => {
  const stub = install({ getBalance: () => 555n })
  const data = aggregate3Calldata([
    { target: MULTICALL3, callData: getEthBalanceCalldata(OWNER) },
    { target: MULTICALL3, callData: opaqueCalldata() },
  ])
  const upstream = {
    jsonrpc: '2.0',
    id: 2,
    result: encodeAbiParameters(RESULT_TUPLE, [
      [
        { success: true, returnData: '0x00' as Hex },
        { success: true, returnData: '0x0000000000000000000000000000000000000000000000000000000000000009' as Hex },
      ],
    ]),
  }
  const route = createStubRoute({ id: 2, method: 'eth_call', params: [{ to: MULTICALL3, data }, 'latest'] }, upstream)

  await stub.getHandler()(route.route)

  assert.equal(route.fetchCalled, true)
  const results = decodeAggregate3Result(parsedResult(route.fulfilled))
  assert.equal(decodeAbiParameters([{ type: 'uint256' }], results[0].returnData)[0], 555n)
  assert.equal(results[1].returnData, '0x0000000000000000000000000000000000000000000000000000000000000009')
})

test('eth_getTransactionReceipt for the tracked hash reports null until mined, then a receipt', async () => {
  const stub = install({ isMined: () => false })
  const pending = createStubRoute({ id: 3, method: 'eth_getTransactionReceipt', params: [TX_HASH] })
  await stub.getHandler()(pending.route)
  assert.equal(pending.fetchCalled, false)
  assert.equal(parsedResult(pending.fulfilled), null as unknown as Hex)

  const minedStub = install({ isMined: () => true })
  const mined = createStubRoute({ id: 4, method: 'eth_getTransactionReceipt', params: [TX_HASH] })
  await minedStub.getHandler()(mined.route)
  const receipt = JSON.parse(mined.fulfilled?.body ?? 'null') as { result: { transactionHash: string } }
  assert.equal(receipt.result.transactionHash, TX_HASH)
})

test('eth_getTransactionReceipt for an unrelated hash falls back untouched', async () => {
  const stub = install()
  const route = createStubRoute({ id: 5, method: 'eth_getTransactionReceipt', params: [`0x${'11'.repeat(32)}`] })

  await stub.getHandler()(route.route)

  assert.equal(route.fellBack, true)
})

test('an entirely unrelated eth_call falls back untouched, never fetching upstream', async () => {
  const stub = install()
  const route = createStubRoute({
    id: 6,
    method: 'eth_call',
    params: [{ to: MULTICALL3, data: opaqueCalldata() }, 'latest'],
  })

  await stub.getHandler()(route.route)

  assert.equal(route.fellBack, true)
  assert.equal(route.fetchCalled, false)
})
