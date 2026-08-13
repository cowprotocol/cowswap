import { strict as assert } from 'node:assert'
import { beforeEach, test } from 'node:test'

import { installCowProtocolApi } from '../cowProtocolApi'

import { generateOrderId, installOrdersMock } from './index'

import type { BalancesMock } from '../balances'
import type { CowProtocolApiMock } from '../cowProtocolApi'
import type { OrdersMock } from './index'
import type { MockEthFlowTransactionHandle } from '../../support/mockEthFlowTransaction'
import type { BrowserContext, Route } from '@playwright/test'

const OWNER = `0x${'1'.repeat(40)}`

function createStubRoute(url: string, method: string, postData?: unknown): Route {
  const request = {
    url: () => url,
    method: () => method,
    postDataJSON: () => {
      if (postData === undefined) throw new Error('no post data on this stub request')
      return postData
    },
  }
  let fulfilled: { status: number; body: string } | undefined
  return {
    request: () => request,
    fulfill: (opts: { status: number; body: string }) => {
      fulfilled = opts
      return Promise.resolve()
    },
    abort: () => Promise.resolve(),
    fallback: () => Promise.resolve(),
    get fulfilled() {
      return fulfilled
    },
  } as unknown as Route
}

let cowApi: CowProtocolApiMock
let orders: OrdersMock
let capturedHandler: (route: Route) => Promise<void>

beforeEach(async () => {
  const context = {
    route: (_pattern: unknown, handlerFn: (route: Route) => Promise<void>) => {
      capturedHandler = handlerFn
      return Promise.resolve()
    },
  } as unknown as BrowserContext
  cowApi = await installCowProtocolApi(context)
  orders = installOrdersMock(cowApi)
})

function orderByUidRoute(uid: string): Route {
  return createStubRoute(`https://api.cow.fi/mainnet/api/v1/orders/${uid}`, 'GET')
}

function postOrderRoute(body: unknown): Route {
  return createStubRoute('https://api.cow.fi/mainnet/api/v1/orders', 'POST', body)
}

test('expectOrderToBePosted forces the postOrder response to the given orderId', async () => {
  const orderId = generateOrderId()
  const body = { sellToken: '0xaaa', buyToken: '0xbbb', sellAmount: '100', buyAmount: '200', receiver: OWNER }

  await orders.expectOrderToBePosted({
    orderId,
    owner: OWNER,
    trigger: async () => {
      await capturedHandler(postOrderRoute(body))
    },
  })

  const order = orders.getOrder(orderId)
  assert.equal(order?.uid, orderId)
  assert.equal(order?.sellAmount, '100')
  assert.equal(order?.status, 'open')
})

test('expectOrderToBePosted throws when trigger never posts', async () => {
  const orderId = generateOrderId()
  // `timeoutMs` is a test-only escape hatch (default 10_000 in production) — without it this
  // negative case would burn 10 real seconds every run.
  await assert.rejects(
    orders.expectOrderToBePosted({ orderId, owner: OWNER, trigger: async () => {}, timeoutMs: 50 }),
    /no postOrder request observed/,
  )
})

test('order-by-uid dispatches to the matching registry entry, not "the last posted order"', async () => {
  const firstId = generateOrderId()
  const secondId = generateOrderId()
  const firstBody = { sellToken: '0xaaa', buyToken: '0xbbb', sellAmount: '100', buyAmount: '200', receiver: OWNER }
  const secondBody = { sellToken: '0xccc', buyToken: '0xddd', sellAmount: '9', buyAmount: '9', receiver: OWNER }

  await orders.expectOrderToBePosted({
    orderId: firstId,
    owner: OWNER,
    trigger: async () => capturedHandler(postOrderRoute(firstBody)),
  })
  await orders.expectOrderToBePosted({
    orderId: secondId,
    owner: OWNER,
    trigger: async () => capturedHandler(postOrderRoute(secondBody)),
  })

  await capturedHandler(orderByUidRoute(firstId))
  await capturedHandler(orderByUidRoute(secondId))

  assert.equal(orders.getOrder(firstId)?.sellAmount, '100')
  assert.equal(orders.getOrder(secondId)?.sellAmount, '9')
})

test('fulfillOrder debits sell, credits buy, and flips status/orderStatus', async () => {
  const orderId = generateOrderId()
  const body = { sellToken: '0xaaa', buyToken: '0xbbb', sellAmount: '100', buyAmount: '200', receiver: OWNER }
  await orders.expectOrderToBePosted({
    orderId,
    owner: OWNER,
    trigger: async () => capturedHandler(postOrderRoute(body)),
  })

  const sets: Array<[string, number, Record<string, unknown>]> = []
  const balances = {
    set: (owner: string, chainId: number, b: Record<string, unknown>) => sets.push([owner, chainId, b]),
  } as unknown as BalancesMock

  orders.fulfillOrder(orderId, balances, 1, 1000n, 0n)

  assert.deepEqual(sets, [[OWNER, 1, { '0xaaa': '900', '0xbbb': '200' }]])
  assert.equal(orders.getOrder(orderId)?.status, 'fulfilled')
})

test('fulfillOrder throws for an unknown orderId', () => {
  const balances = { set: () => {} } as unknown as BalancesMock
  assert.throws(() => orders.fulfillOrder(generateOrderId(), balances, 1, 0n, 0n), /unknown orderId/)
})

test('reset() clears the registry', async () => {
  const orderId = generateOrderId()
  const body = { sellToken: '0xaaa', buyToken: '0xbbb', sellAmount: '1', buyAmount: '1', receiver: OWNER }
  await orders.expectOrderToBePosted({
    orderId,
    owner: OWNER,
    trigger: async () => capturedHandler(postOrderRoute(body)),
  })
  orders.reset()
  assert.equal(orders.getOrder(orderId), undefined)
})

test('seedOpenOrder registers a cancellable order without any postOrder call', () => {
  const orderId = generateOrderId()
  orders.seedOpenOrder({
    orderId,
    owner: OWNER,
    sellToken: '0xaaa',
    buyToken: '0xbbb',
    sellAmount: 1_000_000n,
    buyAmount: 2_000_000n,
  })

  const order = orders.getOrder(orderId)
  assert.equal(order?.uid, orderId)
  assert.equal(order?.sellAmount, '1000000')
  assert.equal(order?.invalidated, false)
  assert.equal(orders.wasCancelRequested(orderId), false)
})

test('accountOrders answers with only the seeded order, dropping the default fixture list', async () => {
  const orderId = generateOrderId()
  orders.seedOpenOrder({
    orderId,
    owner: OWNER,
    sellToken: '0xaaa',
    buyToken: '0xbbb',
    sellAmount: 1n,
    buyAmount: 1n,
  })

  const route = createStubRoute(`https://api.cow.fi/mainnet/api/v1/account/${OWNER}/orders`, 'GET')
  await capturedHandler(route)
  const body = JSON.parse((route as unknown as { fulfilled?: { body: string } }).fulfilled?.body ?? '[]') as Array<{
    uid: string
  }>
  assert.equal(body.length, 1)
  assert.equal(body[0]?.uid, orderId)
})

test('cancelOrders sets wasCancelRequested only for the named uid', async () => {
  const cancelledId = generateOrderId()
  const otherId = generateOrderId()
  orders.seedOpenOrder({
    orderId: cancelledId,
    owner: OWNER,
    sellToken: '0xa',
    buyToken: '0xb',
    sellAmount: 1n,
    buyAmount: 1n,
  })
  orders.seedOpenOrder({
    orderId: otherId,
    owner: OWNER,
    sellToken: '0xa',
    buyToken: '0xb',
    sellAmount: 1n,
    buyAmount: 1n,
  })

  await capturedHandler(
    createStubRoute('https://api.cow.fi/mainnet/api/v1/orders', 'DELETE', { orderUids: [cancelledId] }),
  )

  assert.equal(orders.wasCancelRequested(cancelledId), true)
  assert.equal(orders.wasCancelRequested(otherId), false)
})

test('markCancelled sets invalidated on the seeded order', () => {
  const orderId = generateOrderId()
  orders.seedOpenOrder({ orderId, owner: OWNER, sellToken: '0xa', buyToken: '0xb', sellAmount: 1n, buyAmount: 1n })
  orders.markCancelled(orderId)
  assert.equal(orders.getOrder(orderId)?.invalidated, true)
})

test('wasCancelRequested and markCancelled throw for an unknown orderId', () => {
  assert.throws(() => orders.wasCancelRequested(generateOrderId()), /unknown orderId/)
  assert.throws(() => orders.markCancelled(generateOrderId()), /unknown orderId/)
})

function fakeEthFlow(
  params: { sellAmount: bigint; buyAmount: bigint; buyToken: string },
  filled = false,
): MockEthFlowTransactionHandle {
  return {
    getOrderParams: () => params,
    isFilled: () => filled,
  } as unknown as import('../../support/mockEthFlowTransaction').MockEthFlowTransactionHandle
}

test('trackEthFlowOrder 404s any uid until markIndexed is called', async () => {
  const tracker = orders.trackEthFlowOrder(fakeEthFlow({ sellAmount: 1n, buyAmount: 2n, buyToken: '0xbbb' }))
  const route = orderByUidRoute(generateOrderId())
  await capturedHandler(route)
  assert.equal((route as unknown as { fulfilled?: { status: number } }).fulfilled?.status, 404)

  tracker.markIndexed()
  const route2 = orderByUidRoute(generateOrderId())
  await capturedHandler(route2)
  assert.equal((route2 as unknown as { fulfilled?: { status: number } }).fulfilled?.status, 200)
})

test('trackEthFlowOrder reports fields from ethFlow.getOrderParams(), reflecting isFilled() live', async () => {
  let filled = false
  const ethFlow = {
    getOrderParams: () => ({ sellAmount: 5n, buyAmount: 9n, buyToken: '0xbbb' }),
    isFilled: () => filled,
  } as unknown as import('../../support/mockEthFlowTransaction').MockEthFlowTransactionHandle

  const tracker = orders.trackEthFlowOrder(ethFlow)
  tracker.markIndexed()

  const route = orderByUidRoute(generateOrderId())
  await capturedHandler(route)
  let body = JSON.parse((route as unknown as { fulfilled?: { body: string } }).fulfilled?.body ?? '{}') as {
    status: string
  }
  assert.equal(body.status, 'open')

  filled = true
  const route2 = orderByUidRoute(generateOrderId())
  await capturedHandler(route2)
  body = JSON.parse((route2 as unknown as { fulfilled?: { body: string } }).fulfilled?.body ?? '{}') as {
    status: string
  }
  assert.equal(body.status, 'fulfilled')
})

test('reset() clears the eth-flow tracker too', async () => {
  orders.trackEthFlowOrder(fakeEthFlow({ sellAmount: 1n, buyAmount: 1n, buyToken: '0xbbb' })).markIndexed()
  orders.reset()

  const route = orderByUidRoute(generateOrderId())
  await capturedHandler(route)
  // No tracker and no registry entry left — falls through to the default fixture (200, not 404).
  assert.equal((route as unknown as { fulfilled?: { status: number } }).fulfilled?.status, 200)
})
