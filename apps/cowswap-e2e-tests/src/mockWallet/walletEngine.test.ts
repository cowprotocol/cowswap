import { verifyMessage, verifyTypedData } from 'viem'

import { privateKeyToAccount } from 'viem/accounts'

import { strict as assert } from 'node:assert'
import { afterEach, beforeEach, test } from 'node:test'

import { createWalletEngine, type WalletEngine } from './walletEngine'

// First anvil/hardhat dev key — public knowledge, never funded on real networks.
const TEST_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80' as const
const TEST_ADDRESS = privateKeyToAccount(TEST_KEY).address

// forward() calls the global fetch directly (Playwright intercepts it in real runs), so we
// stub global.fetch here to stand in for the RPC proxy and record what reached it.
let fetchRequests: Array<{ method: string; params: unknown[] }>
const originalFetch = global.fetch

function stubFetch(results: Record<string, unknown>): void {
  global.fetch = (async (_url: unknown, init?: RequestInit) => {
    const { id, method, params } = JSON.parse(String(init?.body))
    fetchRequests.push({ method, params: params ?? [] })
    const result = results[method]
    const body =
      result === undefined
        ? { jsonrpc: '2.0', id, error: { code: -32601, message: `no stub for ${method}` } }
        : { jsonrpc: '2.0', id, result }
    return new Response(JSON.stringify(body), { headers: { 'content-type': 'application/json' } })
  }) as typeof fetch
}

let engine: WalletEngine
let emitted: Array<{ event: string; payload: unknown }>

beforeEach(() => {
  fetchRequests = []
  stubFetch({ eth_blockNumber: '0x10' })
  engine = createWalletEngine({
    privateKey: TEST_KEY,
    chainId: 11155111,
    emit: (event, payload) => emitted.push({ event, payload }),
  })
  emitted = []
})

afterEach(() => {
  global.fetch = originalFetch
})

async function expectOk(req: { method: string; params?: unknown[] }): Promise<unknown> {
  const envelope = await engine.handleRequest(req)
  assert.equal(envelope.ok, true, JSON.stringify(envelope))
  return (envelope as { ok: true; result: unknown }).result
}

test('identity methods answer locally', async () => {
  assert.deepEqual(await expectOk({ method: 'eth_accounts' }), [TEST_ADDRESS])
  assert.deepEqual(await expectOk({ method: 'eth_requestAccounts' }), [TEST_ADDRESS])
  assert.equal(await expectOk({ method: 'eth_chainId' }), '0xaa36a7')
  assert.equal(await expectOk({ method: 'net_version' }), '11155111')
  assert.equal(fetchRequests.length, 0)
})

test('personal_sign produces a verifiable signature', async () => {
  const message = '0x68656c6c6f' // "hello"
  const signature = (await expectOk({ method: 'personal_sign', params: [message, TEST_ADDRESS] })) as `0x${string}`
  assert.equal(await verifyMessage({ address: TEST_ADDRESS, message: { raw: message }, signature }), true)
})

test('eth_signTypedData_v4 signs and strips EIP712Domain from types', async () => {
  const typed = {
    domain: { name: 'CoW', version: '1', chainId: 11155111 },
    types: {
      EIP712Domain: [{ name: 'name', type: 'string' }],
      Order: [{ name: 'amount', type: 'uint256' }],
    },
    primaryType: 'Order',
    message: { amount: '1' },
  }
  const signature = (await expectOk({
    method: 'eth_signTypedData_v4',
    params: [TEST_ADDRESS, JSON.stringify(typed)],
  })) as `0x${string}`
  assert.equal(
    await verifyTypedData({
      address: TEST_ADDRESS,
      domain: typed.domain,
      types: { Order: typed.types.Order },
      primaryType: 'Order',
      message: typed.message,
      signature,
    }),
    true,
  )
})

test('eth_sendTransaction is unmocked by default and reports the tx params as the error cause', async () => {
  const txParams = { from: TEST_ADDRESS, to: TEST_ADDRESS, value: '0x1' }
  const envelope = await engine.handleRequest({ method: 'eth_sendTransaction', params: [txParams] })
  assert.equal(envelope.ok, false)
  assert.deepEqual(envelope, {
    ok: false,
    error: { code: -32000, message: 'eth_sendTransaction must be mocked!' },
  })
  assert.equal(fetchRequests.length, 0)
})

test('eth_sendTransaction can be stubbed like any other method', async () => {
  const hash = '0x' + '11'.repeat(32)
  engine.stubRpc('eth_sendTransaction', hash)
  assert.equal(
    await expectOk({ method: 'eth_sendTransaction', params: [{ from: TEST_ADDRESS, to: TEST_ADDRESS, value: '0x1' }] }),
    hash,
  )
})

test('unknown methods forward to the RPC proxy for the current chain', async () => {
  assert.equal(await expectOk({ method: 'eth_blockNumber' }), '0x10')
  assert.deepEqual(fetchRequests, [{ method: 'eth_blockNumber', params: [] }])
})

test('wallet_switchEthereumChain updates chainId, emits chainChanged, and forwards keep working', async () => {
  await expectOk({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x1' }] })
  assert.equal(engine.chainId, 1)
  assert.deepEqual(emitted, [{ event: 'chainChanged', payload: '0x1' }])
  await expectOk({ method: 'eth_blockNumber' })
  assert.equal(fetchRequests.length, 1)
})

test('wallet_switchEthereumChain is a no-op when the chain is unchanged', async () => {
  await expectOk({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0xaa36a7' }] })
  assert.equal(engine.chainId, 11155111)
  assert.deepEqual(emitted, [])
})

test('wallet_getCapabilities defaults to empty object', async () => {
  assert.deepEqual(await expectOk({ method: 'wallet_getCapabilities', params: [TEST_ADDRESS] }), {})
})

test('stubRpc overrides a method, restoreRpc removes the stub', async () => {
  engine.stubRpc('wallet_getCapabilities', () => ({ '0xaa36a7': { atomic: { status: 'supported' } } }))
  assert.deepEqual(await expectOk({ method: 'wallet_getCapabilities', params: [TEST_ADDRESS] }), {
    '0xaa36a7': { atomic: { status: 'supported' } },
  })
  engine.restoreRpc('wallet_getCapabilities')
  assert.deepEqual(await expectOk({ method: 'wallet_getCapabilities', params: [TEST_ADDRESS] }), {})
})

test('stubRpc accepts a static value', async () => {
  engine.stubRpc('eth_blockNumber', '0xff')
  assert.equal(await expectOk({ method: 'eth_blockNumber' }), '0xff')
  assert.equal(fetchRequests.length, 0)
})

test('a stub throwing { code, message } becomes an error envelope', async () => {
  engine.stubRpc('eth_signTypedData_v4', () => {
    throw { code: 4001, message: 'User rejected the request.' }
  })
  const envelope = await engine.handleRequest({ method: 'eth_signTypedData_v4', params: [TEST_ADDRESS, '{}'] })
  assert.deepEqual(envelope, { ok: false, error: { code: 4001, message: 'User rejected the request.' } })
})

test('upstream JSON-RPC errors become error envelopes', async () => {
  const envelope = await engine.handleRequest({ method: 'eth_unknownThing' })
  assert.equal(envelope.ok, false)
  assert.equal((envelope as { ok: false; error: { code: number } }).error.code, -32601)
})

test('every request is recorded, including errors, and rpcCalls filters by method', async () => {
  await engine.handleRequest({ method: 'eth_chainId' })
  engine.stubRpc('foo_bar', () => {
    throw { code: 4001, message: 'nope' }
  })
  await engine.handleRequest({ method: 'foo_bar', params: [1] })
  assert.equal(engine.rpcCalls().length, 2)
  assert.deepEqual(engine.rpcCalls('foo_bar'), [
    { method: 'foo_bar', params: [1], error: { code: 4001, message: 'nope' } },
  ])
  assert.deepEqual(engine.rpcCalls('eth_chainId'), [{ method: 'eth_chainId', params: [], result: '0xaa36a7' }])
})
