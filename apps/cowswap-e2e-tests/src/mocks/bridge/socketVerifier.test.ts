import { decodeAbiParameters, encodeAbiParameters, encodeFunctionData, toFunctionSelector } from 'viem'
import type { Address, Hex } from 'viem'

import { strict as assert } from 'node:assert'
import { test } from 'node:test'

import { installSocketVerifier } from './socketVerifier'

import type { BrowserContext, Route } from '@playwright/test'

/**
 * Regression coverage for the exact call reported against CS-297: a real CI failure where
 * `validateRotueId` reverted with `RouteIdNotFound()` on the real chain. This suite tests
 * `installSocketVerifier` in true isolation — nothing else installed on the context — to confirm
 * the mock itself is correct on its own. It is: the actual CS-297 bug was a *different* mock
 * (`installNativeBalanceRoute` in `mockEthFlowTransaction.ts`) claiming the same aggregate3 batch
 * for its own `getEthBalance` slot and leaking the real upstream result for the slot it didn't
 * recognize (`validateRotueId`). That's fixed via `nestedRpcCallRegistry.ts` — a neutral registry
 * `mockContractViewCall` (and therefore this mock) registers into automatically, so an unrelated
 * mock's own merge logic can find this mock's answer without either file importing the other. See
 * `nestedRpcCallRegistry.test.ts` for the real cross-mock composition test with
 * `installNativeBalanceRoute`; nothing here is expected to catch that interaction on its own.
 */

const SOCKET_VERIFIER_ADDRESS = '0xa27a3f5a96df7d8be26ee2790999860c00eb688d'
const VALIDATE_ROTUE_ID_SELECTOR = toFunctionSelector('validateRotueId(bytes,uint32)')
const MULTICALL3 = '0xcA11bde05977b3631167028862bE2a173976CA11'
const AGGREGATE3_SELECTOR = '0x82ad56cb'

// The exact `(callData, expectedRouteId)` args from the CS-297 failure's decoded error:
//   address:   0xa27A3f5A96DF7D8Be26EE2790999860C00eb688D
//   function:  validateRotueId(bytes callData, uint32 expectedRouteId)
//   args:      (0x00000001cc54d224...00, 0x00000001)
const REPORTED_CALL_DATA = '0x00000001cc54d2240000000000000000000000000000000000000000000000000000000000000000' as Hex
const REPORTED_EXPECTED_ROUTE_ID = 1

// `installSocketVerifier`'s own `EMPTY_BYTES`: both stubbed functions are `nonpayable` with no
// outputs, so a successful call resolves to an ABI-encoded zero `uint256`, not a bare `'0x'`.
const EMPTY_BYTES = encodeAbiParameters([{ type: 'uint256' }], [0n])

function reportedValidateRotueIdCalldata(): Hex {
  return encodeFunctionData({
    abi: [
      {
        name: 'validateRotueId',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
          { name: 'callData', type: 'bytes' },
          { name: 'expectedRouteId', type: 'uint32' },
        ],
        outputs: [],
      },
    ],
    functionName: 'validateRotueId',
    args: [REPORTED_CALL_DATA, REPORTED_EXPECTED_ROUTE_ID],
  })
}

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

interface StubRouteResult {
  route: Route
  fulfilled: { body: string } | undefined
  fellBack: boolean
  fetchCalled: boolean
}

function aggregate3Calldata(calls: Array<{ target: string; callData: Hex }>): Hex {
  const encoded = encodeAbiParameters(CALL3_TUPLE, [
    calls.map((c) => ({ target: c.target as Address, allowFailure: true, callData: c.callData })),
  ])
  return `${AGGREGATE3_SELECTOR}${encoded.slice(2)}` as Hex
}

function createStubContext(): { context: BrowserContext; getHandlers: () => Array<(route: Route) => Promise<void>> } {
  const handlers: Array<(route: Route) => Promise<void>> = []
  const context = {
    route: (_pattern: unknown, handlerFn: (route: Route) => Promise<void>) => {
      handlers.push(handlerFn)
      return Promise.resolve()
    },
  } as unknown as BrowserContext
  return { context, getHandlers: () => handlers }
}

function decodeAggregate3Result(blob: Hex): ReadonlyArray<{ success: boolean; returnData: Hex }> {
  return decodeAbiParameters(RESULT_TUPLE, blob)[0] as ReadonlyArray<{ success: boolean; returnData: Hex }>
}

/** Dispatches through every registered handler LIFO (last-registered first), exactly like real
 * Playwright's `context.route()` fallback chaining — a handler that calls `route.fallback()` hands
 * off to the next earlier-registered one instead of terminating the request. */
async function dispatchThroughHandlers(
  handlers: Array<(route: Route) => Promise<void>>,
  postData: unknown,
): Promise<StubRouteResult> {
  const result: StubRouteResult = {
    route: undefined as unknown as Route,
    fulfilled: undefined,
    fellBack: false,
    fetchCalled: false,
  }
  const request = { method: () => 'POST', postDataJSON: () => postData }
  const baseRoute = {
    request: () => request,
    fulfill: (opts: { body: string }) => {
      result.fulfilled = opts
      return Promise.resolve()
    },
    fetch: async () => {
      result.fetchCalled = true
      throw new Error('no upstream response stubbed for this test — installSocketVerifier must resolve locally')
    },
  } as unknown as Route

  for (let i = handlers.length - 1; i >= 0; i--) {
    let fellBack = false
    const wrapped = {
      ...baseRoute,
      fallback: () => {
        fellBack = true
        return Promise.resolve()
      },
    } as Route
    await handlers[i](wrapped)
    if (!fellBack) {
      result.route = wrapped
      return result
    }
  }
  result.fellBack = true
  return result
}

test('installSocketVerifier alone resolves the exact CS-297 reported call (bare, non-batched)', async () => {
  const { context, getHandlers } = createStubContext()
  installSocketVerifier(context)

  const postData = {
    jsonrpc: '2.0',
    id: 1,
    method: 'eth_call',
    params: [{ to: SOCKET_VERIFIER_ADDRESS, data: reportedValidateRotueIdCalldata() }, 'latest'],
  }

  const result = await dispatchThroughHandlers(getHandlers(), postData)

  assert.equal(result.fellBack, false, 'installSocketVerifier should claim this call on its own')
  assert.equal(result.fetchCalled, false, 'must resolve locally, no real RPC round-trip needed')
  assert.ok(result.fulfilled, 'route must be fulfilled')
  const parsed = JSON.parse(result.fulfilled!.body) as { result: Hex }
  assert.equal(parsed.result, EMPTY_BYTES)
})

test('installSocketVerifier alone resolves the exact CS-297 reported call nested in its own aggregate3 batch', async () => {
  const { context, getHandlers } = createStubContext()
  installSocketVerifier(context)

  const data = aggregate3Calldata([{ target: SOCKET_VERIFIER_ADDRESS, callData: reportedValidateRotueIdCalldata() }])
  const postData = { jsonrpc: '2.0', id: 1, method: 'eth_call', params: [{ to: MULTICALL3, data }, 'latest'] }

  const result = await dispatchThroughHandlers(getHandlers(), postData)

  assert.equal(result.fellBack, false)
  assert.equal(result.fetchCalled, false, 'a fully-matched single-call batch must never touch the real node')
  const parsed = JSON.parse(result.fulfilled!.body) as { result: Hex }
  const results = decodeAggregate3Result(parsed.result)
  assert.equal(results.length, 1)
  assert.equal(results[0].success, true, 'must not be the real RouteIdNotFound revert')
  assert.equal(results[0].returnData, EMPTY_BYTES)
})

test('sanity: the reconstructed calldata really carries the reported selector+args', () => {
  const data = reportedValidateRotueIdCalldata()
  assert.ok(data.startsWith(VALIDATE_ROTUE_ID_SELECTOR), 'must carry validateRotueId’s selector')
  assert.ok(data.includes(REPORTED_CALL_DATA.slice(2)), 'must carry the reported callData bytes')
})
