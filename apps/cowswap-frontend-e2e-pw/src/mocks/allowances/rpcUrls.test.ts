import { strict as assert } from 'node:assert'
import { test } from 'node:test'

import { normalizeRpcUrl, resolveRpcChainIds, unconfiguredChainIds } from './rpcUrls'

test('maps configured chains to their normalized URL', () => {
  const map = resolveRpcChainIds({
    REACT_APP_NETWORK_URL_11155111: 'https://sepolia.example/v3/key',
    REACT_APP_NETWORK_URL_100: 'https://gnosis.example/rpc',
  })

  assert.equal(map.get('https://sepolia.example/v3/key'), 11155111)
  assert.equal(map.get('https://gnosis.example/rpc'), 100)
  assert.equal(map.size, 2)
})

test('ignores unset and blank env vars', () => {
  const map = resolveRpcChainIds({ REACT_APP_NETWORK_URL_11155111: '  ' })

  assert.equal(map.size, 0)
})

test('ignores an unparseable URL rather than throwing', () => {
  const map = resolveRpcChainIds({ REACT_APP_NETWORK_URL_1: 'not a url' })

  assert.equal(map.size, 0)
})

test('normalizeRpcUrl ignores a trailing slash and preserves the key path', () => {
  assert.equal(normalizeRpcUrl('https://x.example/v3/key/'), normalizeRpcUrl('https://x.example/v3/key'))
  assert.match(normalizeRpcUrl('https://x.example/v3/key'), /v3\/key$/)
})

test('normalizeRpcUrl keeps the query string', () => {
  assert.notEqual(normalizeRpcUrl('https://x.example/rpc?k=1'), normalizeRpcUrl('https://x.example/rpc'))
})

test('unconfiguredChainIds lists the chains with no env var', () => {
  const missing = unconfiguredChainIds({ REACT_APP_NETWORK_URL_11155111: 'https://sepolia.example' })

  assert.equal(missing.includes(11155111), false)
  assert.equal(missing.includes(1), true)
  assert.equal(missing.includes(100), true)
})
