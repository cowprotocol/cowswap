import { strict as assert } from 'node:assert'
import { test } from 'node:test'

import { COW_API_ENDPOINTS } from './endpoints'
import { resolveDefaultBody, resolveResponse, serializeBody } from './resolve'
import { reply } from './types'

import type { CowApiEndpoint, CowApiRequest } from './types'

const TRADER = '0x1111111111111111111111111111111111111111'
const WETH = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'

function endpoint(key: string): CowApiEndpoint {
  const found = COW_API_ENDPOINTS.find((e) => e.key === key)
  assert.ok(found, `no catalogue entry for ${key}`)
  return found
}

function makeRequest(overrides: Partial<CowApiRequest> = {}): CowApiRequest {
  const url = new URL(`https://barn.api.cow.fi/mainnet/api/v1/account/${TRADER}/orders`)
  return {
    env: 'barn',
    network: 'mainnet',
    chainId: 1,
    method: 'GET',
    url,
    params: { address: TRADER },
    query: url.searchParams,
    body: undefined,
    defaults: undefined,
    ...overrides,
  }
}

test('accountOrders default is re-owned and refreshed', () => {
  const nowSec = Math.floor(Date.now() / 1000)
  const body = resolveDefaultBody(endpoint('accountOrders'), makeRequest()) as Array<Record<string, unknown>>

  assert.ok(Array.isArray(body) && body.length > 0)
  for (const order of body) {
    assert.equal(order.owner, TRADER.toLowerCase())
    assert.equal(order.receiver, TRADER.toLowerCase())
    assert.ok(Number(order.validTo) > nowSec, 'validTo must be in the future')
    assert.ok(Date.parse(String(order.creationDate)) <= Date.now() + 1000)
  }
})

test('order default takes its uid from the path', () => {
  const uid = `0x${'ab'.repeat(56)}`
  const req = makeRequest({ params: { uid, address: TRADER } })
  const body = resolveDefaultBody(endpoint('order'), req) as Record<string, unknown>
  assert.equal(body.uid, uid)
  assert.equal(body.status, 'open')
})

test('quote default echoes the requested pair and scales the opposite side', () => {
  const req = makeRequest({
    method: 'POST',
    params: {},
    body: {
      sellToken: WETH,
      buyToken: USDC,
      from: TRADER,
      receiver: TRADER,
      sellAmountBeforeFee: '500000000000000000',
      kind: 'sell',
    },
  })
  const body = resolveDefaultBody(endpoint('quote'), req) as { quote: Record<string, unknown>; from: string }

  assert.equal(body.quote.sellToken, WETH)
  assert.equal(body.quote.buyToken, USDC)
  assert.equal(body.quote.receiver, TRADER)
  assert.equal(body.from, TRADER)
  assert.equal(body.quote.sellAmount, '500000000000000000')
  assert.ok(BigInt(String(body.quote.buyAmount)) > 0n)
  assert.ok(Number(body.quote.validTo) > Math.floor(Date.now() / 1000))
})

test('quote default honours a buy-kind request', () => {
  const req = makeRequest({
    method: 'POST',
    params: {},
    body: { sellToken: WETH, buyToken: USDC, from: TRADER, kind: 'buy', buyAmountAfterFee: '1000000000' },
  })
  const body = resolveDefaultBody(endpoint('quote'), req) as { quote: Record<string, unknown> }
  assert.equal(body.quote.buyAmount, '1000000000')
  assert.ok(BigInt(String(body.quote.sellAmount)) > 0n)
})

test('a literal override replaces the body and skips normalization', async () => {
  const res = await resolveResponse({
    endpoint: endpoint('accountOrders'),
    req: makeRequest(),
    override: [{ uid: '0xdead', owner: 'someone-else' }],
  })
  assert.equal(res.status, 200)
  assert.deepEqual(res.body, [{ uid: '0xdead', owner: 'someone-else' }])
})

test('a factory override receives the normalized defaults', async () => {
  const res = await resolveResponse({
    endpoint: endpoint('order'),
    req: makeRequest({ params: { uid: `0x${'cd'.repeat(56)}` } }),
    override: ({ params, defaults }) => ({ ...(defaults as object), uid: params.uid, status: 'fulfilled' }),
  })
  const body = res.body as Record<string, unknown>
  assert.equal(body.status, 'fulfilled')
  assert.equal(body.uid, `0x${'cd'.repeat(56)}`)
  assert.ok('sellToken' in body, 'defaults should have been spread in')
})

test('reply() controls the status code', async () => {
  const res = await resolveResponse({
    endpoint: endpoint('quote'),
    req: makeRequest({ method: 'POST', body: {} }),
    override: reply(429, { errorType: 'TooManyRequests' }),
  })
  assert.equal(res.status, 429)
  assert.deepEqual(res.body, { errorType: 'TooManyRequests' })
})

test('a factory may return reply()', async () => {
  const res = await resolveResponse({
    endpoint: endpoint('quote'),
    req: makeRequest({ method: 'POST', body: {} }),
    override: () => reply(500, { errorType: 'InternalError' }),
  })
  assert.equal(res.status, 500)
})

test('version resolves as text/plain', async () => {
  const res = await resolveResponse({ endpoint: endpoint('version'), req: makeRequest(), override: undefined })
  assert.equal(res.contentType, 'text/plain')
  assert.equal(typeof res.body, 'string')
})

test('postOrder computes a deterministic uid from the request', () => {
  const req = makeRequest({
    method: 'POST',
    params: {},
    body: { sellToken: WETH, buyToken: USDC, from: TRADER, sellAmount: '1' },
  })
  const first = resolveDefaultBody(endpoint('postOrder'), req)
  const second = resolveDefaultBody(endpoint('postOrder'), req)
  assert.equal(typeof first, 'string')
  assert.match(first as string, /^0x[0-9a-f]{112}$/)
  assert.equal(first, second, 'same request body must yield the same uid')
})

test('serializeBody renders a null or undefined body as an empty string', () => {
  assert.equal(serializeBody(null, 'application/json'), '')
  assert.equal(serializeBody(undefined, 'text/plain'), '')
})

test('serializeBody sends a non-JSON string body raw, not quoted', () => {
  const version = 'main@2193c8c69c65c7d439d63e0e34f6bdb587dd4970'
  assert.equal(serializeBody(version, 'text/plain'), version)
})

test('serializeBody JSON-encodes an object body under a JSON content type', () => {
  assert.equal(serializeBody({ uid: '0xdead' }, 'application/json'), JSON.stringify({ uid: '0xdead' }))
})
