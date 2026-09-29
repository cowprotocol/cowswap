import { strict as assert } from 'node:assert'
import { test } from 'node:test'

import { COW_API_ENDPOINTS, COW_API_ENDPOINT_KEYS, matchEndpoint, parseCowApiUrl } from './endpoints'

const ACCOUNT = '0xfb3c7eb936cAA12B5A884d612393969A557d4307'
const ORDER_UID =
  '0x71622d8563a51e03b4f32cfaa8c6e80c6fd6a22eeacf1a00d41309326ba7f13afb3c7eb936caa12b5a884d612393969a557d43076bfb1da4'
const TX_HASH = '0x4cda04d9e5872969256306c98540279f10a822a718e85d46d535c50c2555fe2d'
const APP_DATA_HASH = '0xbc9e102748829db8395db85375d62375efe09b7109bc3aab8c12518fa22fe459'

test('parseCowApiUrl splits host, network and path', () => {
  const parsed = parseCowApiUrl(`https://barn.api.cow.fi/mainnet/api/v1/account/${ACCOUNT}/orders?offset=0&limit=10`)
  assert.deepEqual(parsed, {
    env: 'barn',
    network: 'mainnet',
    chainId: 1,
    path: `/api/v1/account/${ACCOUNT}/orders`,
  })
})

test('parseCowApiUrl recognises the prod host', () => {
  const parsed = parseCowApiUrl('https://api.cow.fi/sepolia/api/v1/version')
  assert.equal(parsed?.env, 'prod')
  assert.equal(parsed?.chainId, 11155111)
})

test('parseCowApiUrl leaves chainId undefined for an unknown slug', () => {
  const parsed = parseCowApiUrl('https://api.cow.fi/atlantis/api/v1/version')
  assert.equal(parsed?.network, 'atlantis')
  assert.equal(parsed?.chainId, undefined)
  assert.equal(parsed?.path, '/api/v1/version')
})

test('parseCowApiUrl returns null for a non-CoW host', () => {
  assert.equal(parseCowApiUrl('https://bff.cow.fi/1/tokens/0x00/usdPrice'), null)
})

test('matchEndpoint resolves account orders and captures the address', () => {
  const matched = matchEndpoint('GET', `/api/v1/account/${ACCOUNT}/orders`)
  assert.equal(matched?.endpoint.key, 'accountOrders')
  assert.equal(matched?.params.address, ACCOUNT)
})

test('matchEndpoint distinguishes order from orderStatus', () => {
  assert.equal(matchEndpoint('GET', `/api/v1/orders/${ORDER_UID}`)?.endpoint.key, 'order')
  assert.equal(matchEndpoint('GET', `/api/v1/orders/${ORDER_UID}/status`)?.endpoint.key, 'orderStatus')
})

test('matchEndpoint discriminates on method for /api/v1/orders', () => {
  assert.equal(matchEndpoint('POST', '/api/v1/orders')?.endpoint.key, 'postOrder')
  assert.equal(matchEndpoint('DELETE', '/api/v1/orders')?.endpoint.key, 'cancelOrders')
  assert.equal(matchEndpoint('GET', '/api/v1/orders'), null)
})

test('matchEndpoint discriminates on method for /api/v1/app_data/{hash}', () => {
  assert.equal(matchEndpoint('GET', `/api/v1/app_data/${APP_DATA_HASH}`)?.endpoint.key, 'appData')
  assert.equal(matchEndpoint('PUT', `/api/v1/app_data/${APP_DATA_HASH}`)?.endpoint.key, 'putAppData')
})

test('matchEndpoint keeps solver competition variants apart', () => {
  assert.equal(matchEndpoint('GET', '/api/v2/solver_competition/15567158')?.endpoint.key, 'solverCompetition')
  const byTx = matchEndpoint('GET', `/api/v2/solver_competition/by_tx_hash/${TX_HASH}`)
  assert.equal(byTx?.endpoint.key, 'solverCompetitionByTx')
  assert.equal(byTx?.params.txHash, TX_HASH)
})

test('matchEndpoint resolves the remaining catalogue entries', () => {
  assert.equal(matchEndpoint('GET', `/api/v1/transactions/${TX_HASH}/orders`)?.endpoint.key, 'transactionOrders')
  assert.equal(
    matchEndpoint('GET', '/api/v1/token/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2/native_price')?.endpoint.key,
    'nativePrice',
  )
  assert.equal(matchEndpoint('GET', `/api/v1/users/${ACCOUNT}/total_surplus`)?.endpoint.key, 'totalSurplus')
  assert.equal(matchEndpoint('POST', '/api/v1/quote')?.endpoint.key, 'quote')
  assert.equal(matchEndpoint('GET', '/api/v1/version')?.endpoint.key, 'version')
  assert.equal(matchEndpoint('GET', '/api/v2/trades')?.endpoint.key, 'trades')
})

test('matchEndpoint returns null for an unknown path', () => {
  assert.equal(matchEndpoint('GET', '/api/v1/auction'), null)
})

test('every sample path matches exactly one catalogue entry', () => {
  const samples: Array<[string, string]> = [
    ['GET', `/api/v1/account/${ACCOUNT}/orders`],
    ['GET', `/api/v1/orders/${ORDER_UID}`],
    ['GET', `/api/v1/orders/${ORDER_UID}/status`],
    ['POST', '/api/v1/orders'],
    ['DELETE', '/api/v1/orders'],
    ['GET', `/api/v1/transactions/${TX_HASH}/orders`],
    ['GET', '/api/v1/token/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2/native_price'],
    ['GET', `/api/v1/users/${ACCOUNT}/total_surplus`],
    ['GET', `/api/v1/app_data/${APP_DATA_HASH}`],
    ['PUT', `/api/v1/app_data/${APP_DATA_HASH}`],
    ['POST', '/api/v1/quote'],
    ['GET', '/api/v1/version'],
    ['GET', '/api/v2/trades'],
    ['GET', '/api/v2/solver_competition/15567158'],
    ['GET', `/api/v2/solver_competition/by_tx_hash/${TX_HASH}`],
  ]
  for (const [method, path] of samples) {
    const hits = COW_API_ENDPOINTS.filter((e) => e.method === method && e.match.test(path))
    assert.equal(hits.length, 1, `${method} ${path} matched ${hits.length} entries: ${hits.map((h) => h.key)}`)
  }
})

test('catalogue keys are unique', () => {
  const keys = COW_API_ENDPOINTS.map((e) => e.key)
  assert.equal(new Set(keys).size, keys.length)
})

test('CowApiEndpointKey union covers exactly the catalogue', () => {
  assert.deepEqual([...COW_API_ENDPOINT_KEYS].sort(), COW_API_ENDPOINTS.map((e) => e.key).sort())
})
