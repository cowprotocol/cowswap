import { verifyMessage, verifyTypedData } from 'viem'

import { privateKeyToAccount } from 'viem/accounts'

import { strict as assert } from 'node:assert'
import { createServer, type Server } from 'node:http'
import { after, before, beforeEach, test } from 'node:test'

import { createWalletEngine, type WalletEngine } from './walletEngine'

// First anvil/hardhat dev key — public knowledge, never funded on real networks.
const TEST_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80' as const
const TEST_ADDRESS = privateKeyToAccount(TEST_KEY).address

// Minimal JSON-RPC upstream standing in for the RPC proxy. Records requests,
// answers eth_blockNumber, echoes eth_getTransactionCount = 0x0 and fee fields
// so eth_sendTransaction can fill and sign.
let upstream: Server
let upstreamUrl: string
let upstreamRequests: Array<{ path: string; method: string; params: unknown[] }>

before(async () => {
  upstream = createServer((req, res) => {
    let body = ''
    req.on('data', (c) => (body += c))
    req.on('end', () => {
      const { id, method, params } = JSON.parse(body)
      upstreamRequests.push({ path: req.url ?? '', method, params: params ?? [] })
      const results: Record<string, unknown> = {
        eth_blockNumber: '0x10',
        eth_chainId: '0xaa36a7',
        eth_getTransactionCount: '0x0',
        eth_estimateGas: '0x5208',
        eth_gasPrice: '0x3b9aca00',
        eth_maxPriorityFeePerGas: '0x1',
        eth_getBlockByNumber: { baseFeePerGas: '0x1', gasLimit: '0x1c9c380', number: '0x10' },
        eth_sendRawTransaction: '0x' + '11'.repeat(32),
      }
      const result = results[method]
      res.setHeader('content-type', 'application/json')
      if (result === undefined) {
        res.end(JSON.stringify({ jsonrpc: '2.0', id, error: { code: -32601, message: `no stub for ${method}` } }))
      } else {
        res.end(JSON.stringify({ jsonrpc: '2.0', id, result }))
      }
    })
  })
  await new Promise<void>((resolve) => upstream.listen(0, '127.0.0.1', resolve))
  const address = upstream.address()
  if (typeof address === 'string' || address === null) throw new Error('unexpected address')
  upstreamUrl = `http://127.0.0.1:${address.port}`
})

after(() => new Promise<void>((resolve, reject) => upstream.close((e) => (e ? reject(e) : resolve()))))

let engine: WalletEngine
let emitted: Array<{ event: string; payload: unknown }>

beforeEach(() => {
  upstreamRequests = []
  emitted = []
  engine = createWalletEngine({
    privateKey: TEST_KEY,
    chainId: 11155111,
    workerId: 'w0',
    proxyBaseUrl: upstreamUrl,
    emit: (event, payload) => emitted.push({ event, payload }),
  })
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
  assert.equal(upstreamRequests.length, 0)
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

test('eth_sendTransaction signs locally and submits raw tx to the proxy partition', async () => {
  const hash = await expectOk({
    method: 'eth_sendTransaction',
    params: [{ from: TEST_ADDRESS, to: TEST_ADDRESS, value: '0x1' }],
  })
  assert.equal(hash, '0x' + '11'.repeat(32))
  const raw = upstreamRequests.find((r) => r.method === 'eth_sendRawTransaction')
  assert.ok(raw, 'eth_sendRawTransaction reached upstream')
  assert.equal(raw.path, '/rpc/11155111/w0')
})

test('unknown methods forward to the proxy partition for the current chain', async () => {
  assert.equal(await expectOk({ method: 'eth_blockNumber' }), '0x10')
  assert.deepEqual(upstreamRequests, [{ path: '/rpc/11155111/w0', method: 'eth_blockNumber', params: [] }])
})

test('wallet_switchEthereumChain updates chainId, emits chainChanged, and re-routes forwards', async () => {
  await expectOk({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x1' }] })
  assert.equal(engine.chainId, 1)
  assert.deepEqual(emitted, [{ event: 'chainChanged', payload: '0x1' }])
  await expectOk({ method: 'eth_blockNumber' })
  assert.equal(upstreamRequests.at(-1)?.path, '/rpc/1/w0')
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
  assert.equal(upstreamRequests.length, 0)
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
