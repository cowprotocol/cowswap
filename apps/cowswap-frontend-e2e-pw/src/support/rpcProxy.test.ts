import { strict as assert } from 'node:assert'
import { test } from 'node:test'

import { CHAIN_IDS } from './constants'
import { createRpcProxy, RpcProxy } from './rpcProxy'

async function postRpc(url: string, body: unknown): Promise<unknown> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  return res.json()
}

let proxy: RpcProxy

test.before(async () => {
  // port 0 = ephemeral; unit tests don't depend on the fixed cache-build port.
  proxy = await createRpcProxy({ sepoliaRpcUrl: 'http://127.0.0.1:1' /* never reached */, port: 0 })
})

test.after(async () => {
  await proxy.close()
})

test.beforeEach(async () => {
  proxy.reset()
})

test('eth_chainId returns the path-encoded chainId in hex', async () => {
  const r = (await postRpc(`${proxy.url}/rpc/${CHAIN_IDS.MAINNET}/w0`, {
    jsonrpc: '2.0',
    id: 1,
    method: 'eth_chainId',
    params: [],
  })) as { result: string }
  assert.equal(r.result, '0x1')
})

test('net_version returns the path-encoded chainId in decimal', async () => {
  const r = (await postRpc(`${proxy.url}/rpc/${CHAIN_IDS.ARBITRUM}/w0`, {
    jsonrpc: '2.0',
    id: 1,
    method: 'net_version',
    params: [],
  })) as { result: string }
  assert.equal(r.result, '42161')
})

test('stubbed eth_getBalance returns the stubbed value', async () => {
  proxy.setBalance({ chainId: CHAIN_IDS.MAINNET, workerId: 'w0', address: '0xabc', valueHex: '0xde0b6b3a7640000' })
  const r = (await postRpc(`${proxy.url}/rpc/${CHAIN_IDS.MAINNET}/w0`, {
    jsonrpc: '2.0',
    id: 1,
    method: 'eth_getBalance',
    params: ['0xabc', 'latest'],
  })) as { result: string }
  assert.equal(r.result, '0xde0b6b3a7640000')
})

test('reset() clears stubs for a worker partition', async () => {
  proxy.setBalance({ chainId: CHAIN_IDS.MAINNET, workerId: 'w0', address: '0xabc', valueHex: '0x1' })
  proxy.reset({ workerId: 'w0' })
  const r = (await postRpc(`${proxy.url}/rpc/${CHAIN_IDS.MAINNET}/w0`, {
    jsonrpc: '2.0',
    id: 1,
    method: 'eth_getBalance',
    params: ['0xabc', 'latest'],
  })) as { result?: string; error?: { message: string } }
  // With no stub and a dummy upstream URL, the proxy returns an error rather than fabricating a balance.
  assert.ok(r.error, 'expected error when no stub and no usable upstream')
})

test('admin/setBalance and reset work over HTTP', async () => {
  await fetch(`${proxy.url}/admin/setBalance`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chainId: CHAIN_IDS.MAINNET, workerId: 'w0', address: '0xabc', valueHex: '0xff' }),
  })
  const r = (await postRpc(`${proxy.url}/rpc/${CHAIN_IDS.MAINNET}/w0`, {
    jsonrpc: '2.0',
    id: 1,
    method: 'eth_getBalance',
    params: ['0xabc', 'latest'],
  })) as { result: string }
  assert.equal(r.result, '0xff')

  await fetch(`${proxy.url}/admin/reset`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ workerId: 'w0' }),
  })
})
