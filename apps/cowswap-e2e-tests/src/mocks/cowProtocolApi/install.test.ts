import { getAddressKey } from '@cowprotocol/cow-sdk'

import { strict as assert } from 'node:assert'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { beforeEach, test } from 'node:test'

import { installCowProtocolApi, reply } from './index'

import type { CowProtocolApiMock } from './index'
import type { BrowserContext, Route } from '@playwright/test'

/**
 * `installCowProtocolApi` only touches `context.route(pattern, handler)` and,
 * inside the handler, `route.request().{url,method,postDataJSON}` plus
 * `route.{fulfill,abort,fallback}`. These stubs cover exactly that surface —
 * standing in for Playwright's real `BrowserContext`/`Route` so the real
 * route handler (catalogue matching, normalization, serialization, error
 * handling) runs unmodified against them.
 */

const ADDRESS = `0x${'1'.repeat(40)}`
const ORDER_UID = `0x${'ab'.repeat(56)}`

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

function createStubRoute(
  url: string,
  method: string,
  postData?: unknown,
): {
  route: Route
  fulfilled: { status: number; contentType: string; body: string } | undefined
  abortedWith: string | undefined
  fellBack: boolean
} {
  const result = {
    route: undefined as unknown as Route,
    fulfilled: undefined as { status: number; contentType: string; body: string } | undefined,
    abortedWith: undefined as string | undefined,
    fellBack: false,
  }
  const request = {
    url: () => url,
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
    abort: (errorCode?: string) => {
      result.abortedWith = errorCode ?? 'failed'
      return Promise.resolve()
    },
    fallback: () => {
      result.fellBack = true
      return Promise.resolve()
    },
  } as unknown as Route
  return result
}

function parsedBody(fulfilled: { body: string } | undefined): unknown {
  return JSON.parse(fulfilled?.body ?? 'null') as unknown
}

let mock: CowProtocolApiMock
let handler: (route: Route) => Promise<void>

beforeEach(async () => {
  const stub = createStubContext()
  mock = await installCowProtocolApi(stub.context)
  handler = stub.getHandler()
})

test('a matched GET fulfills the normalized default, re-owned to the requested address', async () => {
  const url = `https://barn.api.cow.fi/mainnet/api/v1/account/${ADDRESS}/orders`
  const stub = createStubRoute(url, 'GET')
  await handler(stub.route)

  assert.equal(stub.fulfilled?.status, 200)
  assert.equal(stub.fulfilled?.contentType, 'application/json')
  const body = parsedBody(stub.fulfilled) as Array<{ owner: string; receiver: string }>
  assert.ok(Array.isArray(body) && body.length > 0)
  for (const order of body) {
    assert.equal(order.owner, getAddressKey(ADDRESS))
    assert.equal(order.receiver, getAddressKey(ADDRESS))
  }
})

test('GET version fulfills text/plain with a raw, unquoted string body', async () => {
  const expected = JSON.parse(readFileSync(path.join(__dirname, 'fixtures', 'version.json'), 'utf8')) as string

  const stub = createStubRoute('https://api.cow.fi/mainnet/api/v1/version', 'GET')
  await handler(stub.route)

  assert.equal(stub.fulfilled?.contentType, 'text/plain')
  // Would fail if serializeBody ever started JSON-quoting text/plain bodies.
  assert.equal(stub.fulfilled?.body, expected)
  assert.ok(!stub.fulfilled?.body.startsWith('"'), 'body must not be JSON-quoted')
})

test('a set() override is served instead of the default', async () => {
  mock.set('order', ({ params, defaults }) => ({ ...(defaults as object), uid: params.uid, status: 'fulfilled' }))

  const stub = createStubRoute(`https://api.cow.fi/mainnet/api/v1/orders/${ORDER_UID}`, 'GET')
  await handler(stub.route)

  assert.equal(stub.fulfilled?.status, 200)
  const body = parsedBody(stub.fulfilled) as { uid: string; status: string }
  assert.equal(body.uid, ORDER_UID)
  assert.equal(body.status, 'fulfilled')
})

test('a reply() override produces the given status', async () => {
  mock.set('quote', reply(429, { errorType: 'TooManyRequests' }))

  const stub = createStubRoute('https://api.cow.fi/mainnet/api/v1/quote', 'POST')
  await handler(stub.route)

  assert.equal(stub.fulfilled?.status, 429)
  assert.deepEqual(parsedBody(stub.fulfilled), { errorType: 'TooManyRequests' })
})

test('an un-mocked path aborts, is recorded, and fails teardown until allowed', async () => {
  const url = 'https://api.cow.fi/mainnet/api/v1/auction'
  const stub = createStubRoute(url, 'GET')
  await handler(stub.route)

  assert.equal(stub.abortedWith, 'blockedbyclient')
  assert.deepEqual([...mock.unmatched], [`GET ${url}`])
  assert.throws(
    () => mock.assertNoUnmatched(),
    (error: unknown) => error instanceof Error && error.message.includes(url),
  )

  mock.allowUnmocked()
  assert.doesNotThrow(() => mock.assertNoUnmatched())
})

test('POST orders fulfills a uid and records the posted body', async () => {
  const order = { sellToken: '0xabc', buyToken: '0xdef', from: ADDRESS, sellAmount: '1' }
  const stub = createStubRoute('https://api.cow.fi/mainnet/api/v1/orders', 'POST', order)
  await handler(stub.route)

  assert.equal(stub.fulfilled?.status, 200)
  const uid = parsedBody(stub.fulfilled) as string
  assert.match(uid, /^0x[0-9a-f]{112}$/)
  assert.equal(mock.posted.length, 1)
  assert.equal(mock.posted[0]?.uid, uid)
  assert.deepEqual(mock.posted[0]?.body, order)
})

test('a throwing override is caught, fulfilled as 500, and still fails teardown after allowUnmocked', async () => {
  mock.set('order', () => {
    throw new Error('boom')
  })

  const stub = createStubRoute(`https://api.cow.fi/mainnet/api/v1/orders/${ORDER_UID}`, 'GET')
  await handler(stub.route)

  assert.equal(stub.fulfilled?.status, 500)
  assert.equal(mock.mockErrors.length, 1)
  assert.match(mock.mockErrors[0] ?? '', /boom/)

  mock.allowUnmocked()
  assert.throws(() => mock.assertNoUnmatched(), /mock errors were recorded/)
})

test('reset() clears overrides, posted, unmatched, and mockErrors', async () => {
  mock.set('order', () => {
    throw new Error('boom')
  })
  await handler(createStubRoute(`https://api.cow.fi/mainnet/api/v1/orders/${ORDER_UID}`, 'GET').route)
  await handler(createStubRoute('https://api.cow.fi/mainnet/api/v1/orders', 'POST', { sellToken: '0xabc' }).route)
  await handler(createStubRoute('https://api.cow.fi/mainnet/api/v1/auction', 'GET').route)

  assert.ok(mock.mockErrors.length > 0)
  assert.ok(mock.posted.length > 0)
  assert.ok(mock.unmatched.length > 0)

  mock.reset()

  assert.equal(mock.mockErrors.length, 0)
  assert.equal(mock.posted.length, 0)
  assert.equal(mock.unmatched.length, 0)
  assert.doesNotThrow(() => mock.assertNoUnmatched())

  // The `order` override must be gone too: the same request now serves a 200 default, not a 500.
  const afterReset = createStubRoute(`https://api.cow.fi/mainnet/api/v1/orders/${ORDER_UID}`, 'GET')
  await handler(afterReset.route)
  assert.equal(afterReset.fulfilled?.status, 200)
})
