import { decodeAbiParameters } from 'viem'
import type { Address, Hex } from 'viem'

import { strict as assert } from 'node:assert'
import { test } from 'node:test'

import { installNativeBalanceRoute } from './mockEthFlowTransaction'
import { registerNestedCallResolver, resolveNestedCall } from './nestedRpcCallRegistry'

import { installSocketVerifier } from '../mocks/bridge/socketVerifier'

import type { BrowserContext, Route } from '@playwright/test'

const ADDRESS_A = '0x1111111111111111111111111111111111111111' as Address
const ADDRESS_B = '0x2222222222222222222222222222222222222222' as Address

test('resolveNestedCall returns undefined when nothing is registered for this context', () => {
  const context = {} as BrowserContext
  assert.equal(resolveNestedCall(context, ADDRESS_A, '0xdeadbeef'), undefined)
})

test('resolveNestedCall returns a registered resolver’s answer', () => {
  const context = {} as BrowserContext
  registerNestedCallResolver(context, (target, callData) =>
    target === ADDRESS_A && callData === '0xdeadbeef' ? '0x2a' : undefined,
  )

  assert.equal(resolveNestedCall(context, ADDRESS_A, '0xdeadbeef'), '0x2a')
  assert.equal(resolveNestedCall(context, ADDRESS_B, '0xdeadbeef'), undefined, 'a different target must not match')
})

test('resolveNestedCall tries every registered resolver in order and returns the first match', () => {
  const context = {} as BrowserContext
  registerNestedCallResolver(context, () => undefined)
  registerNestedCallResolver(context, (target) => (target === ADDRESS_B ? '0xb' : undefined))

  assert.equal(resolveNestedCall(context, ADDRESS_B, '0x'), '0xb')
})

test('resolvers are scoped per context — one context’s registrations never leak into another’s', () => {
  const contextA = {} as BrowserContext
  const contextB = {} as BrowserContext
  registerNestedCallResolver(contextA, () => '0xa')

  assert.equal(resolveNestedCall(contextA, ADDRESS_A, '0x'), '0xa')
  assert.equal(resolveNestedCall(contextB, ADDRESS_A, '0x'), undefined)
})

// --- Real cross-mock composition: installSocketVerifier + installNativeBalanceRoute -----------

const RESULT_TUPLE = [
  {
    type: 'tuple[]',
    components: [
      { name: 'success', type: 'bool' },
      { name: 'returnData', type: 'bytes' },
    ],
  },
] as const

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
 * Playwright's `context.route()` fallback chaining. */
async function dispatchThroughHandlers(
  handlers: Array<(route: Route) => Promise<void>>,
  postData: unknown,
  upstreamJson?: unknown,
): Promise<{ fulfilledBody: string | undefined; fellBack: boolean; fetchCalled: boolean }> {
  const state = { fulfilledBody: undefined as string | undefined, fellBack: false, fetchCalled: false }
  const request = { method: () => 'POST', postDataJSON: () => postData }
  const baseRoute = {
    request: () => request,
    fulfill: (opts: { body: string }) => {
      state.fulfilledBody = opts.body
      return Promise.resolve()
    },
    fetch: async () => {
      state.fetchCalled = true
      if (upstreamJson === undefined) throw new Error('no upstream response stubbed for this test')
      return { json: async () => upstreamJson }
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
    if (!fellBack) return state
  }
  state.fellBack = true
  return state
}

test('CS-297: installSocketVerifier + installNativeBalanceRoute together resolve a mixed batch correctly, without importing each other', async () => {
  // Captured verbatim from the CS-297 CI failure: the owner's own `getEthBalance` batched
  // alongside SocketVerifier's `validateRotueId`, in the *same* aggregate3 call, as `eth_call` id
  // 29. `installNativeBalanceRoute` (registered from the ETH-flow test body, so it always has the
  // highest route priority) claims the batch for its own `getEthBalance` slot, and finds the
  // `validateRotueId` slot's answer through `nestedRpcCallRegistry.ts` — populated automatically by
  // `installSocketVerifier` via `mockContractViewCall` — instead of ever fetching the real,
  // reverting upstream result for it.
  const capturedEntry = {
    jsonrpc: '2.0',
    id: 29,
    method: 'eth_call',
    params: [
      {
        to: '0xca11bde05977b3631167028862be2a173976ca11',
        data: '0x82ad56cb0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000100000000000000000000000000ca11bde05977b3631167028862be2a173976ca110000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000244d2301cc0000000000000000000000008eb7cc3c5d90d2d6c835245d21622971628bdeb400000000000000000000000000000000000000000000000000000000000000000000000000000000a27a3f5a96df7d8be26ee2790999860c00eb688d0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a4eee54b0d00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002800000001cc54d224000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      },
      'latest',
    ],
  }
  const owner = '0x8eb7cc3c5d90d2d6c835245d21622971628bdeb4'

  const { context, getHandlers } = createStubContext()
  // Registration order mirrors the real fixture: installSocketVerifier (shared fixture, early)
  // before installNativeBalanceRoute (per-test, from the ETH-flow test body, later — highest LIFO
  // priority, exactly like the real bug's registration order).
  installSocketVerifier(context)
  installNativeBalanceRoute({
    context,
    owner,
    txHash: `0x${'ef'.repeat(32)}` as Hex,
    getBalance: () => 10n ** 18n,
    isMined: () => false,
  })

  const result = await dispatchThroughHandlers(getHandlers(), capturedEntry)

  assert.equal(result.fellBack, false, 'installNativeBalanceRoute must claim the batch for its own ownBalance slot')
  assert.equal(result.fetchCalled, false, 'both slots are locally answerable, no real RPC round-trip needed')
  const results = decodeAggregate3Result((JSON.parse(result.fulfilledBody!) as { result: Hex }).result)
  assert.equal(results.length, 2)
  assert.equal(decodeAbiParameters([{ type: 'uint256' }], results[0].returnData)[0], 10n ** 18n)
  assert.equal(results[1].success, true, 'must not be the real RouteIdNotFound revert')
})
