import assert from 'node:assert/strict'
import test from 'node:test'

import { pinSecondaryProviders } from './ipfs-pin-secondary.mjs'

const CID = 'bafybeigdyrzt3sfp7udm7hu76jge2pe2bghlxve5jiijb2qlbtndk2nlky'

const provider = (name, outcome) => ({
  name,
  pin: async () => outcome,
})

test('passes when at least one secondary provider pins successfully', async () => {
  const result = await pinSecondaryProviders(CID, {
    providers: [
      provider('4EVERLAND', { status: 'pinned' }),
      provider('IPFS Ninja', { status: 'failed', error: 'quota' }),
    ],
  })

  assert.equal(result.ok, true)
  assert.deepEqual(
    result.results.map(({ status }) => status),
    ['pinned', 'failed'],
  )
})

test('treats an already-existing pin as successful', async () => {
  const result = await pinSecondaryProviders(CID, {
    providers: [{ name: 'IPFS Ninja', pin: async () => ({ status: 'exists' }) }],
  })

  assert.equal(result.ok, true)
  assert.equal(result.results[0].status, 'pinned')
})

test('fails when every secondary provider fails', async () => {
  const result = await pinSecondaryProviders(CID, {
    providers: [
      provider('4EVERLAND', { status: 'timeout' }),
      provider('IPFS Ninja', { status: 'failed', error: 'forbidden' }),
    ],
  })

  assert.equal(result.ok, false)
  assert.equal(result.results.filter(({ status }) => status === 'pinned').length, 0)
})

test('does not call a provider without credentials', async () => {
  let called = false
  const result = await pinSecondaryProviders(CID, {
    providers: [
      {
        name: 'missing',
        pin: async () => {
          called = true
          return { status: 'pinned' }
        },
      },
    ],
    credentials: new Map([['missing', false]]),
  })

  assert.equal(called, false)
  assert.deepEqual(result.results, [
    { name: 'missing', status: 'missing-credential', error: 'credential is not configured' },
  ])
})

test('continues polling until a provider reports pinned', async () => {
  let attempts = 0
  const result = await pinSecondaryProviders(CID, {
    providers: [
      {
        name: 'polling',
        pin: async () => {
          attempts += 1
          return attempts === 1 ? { status: 'pinning' } : { status: 'pinned' }
        },
      },
    ],
    pollMs: 0,
  })

  assert.equal(attempts, 2)
  assert.equal(result.results[0].status, 'pinned')
})

test('retries a transient provider outage', async () => {
  let attempts = 0
  const result = await pinSecondaryProviders(CID, {
    providers: [
      {
        name: 'transient',
        pin: async () => {
          attempts += 1
          if (attempts === 1) throw Object.assign(new Error('503 unavailable'), { status: 503 })
          return { status: 'pinned' }
        },
      },
    ],
    pollMs: 0,
  })

  assert.equal(attempts, 2)
  assert.equal(result.results[0].status, 'pinned')
})

test('retries a statusless transport failure', async () => {
  let attempts = 0
  const result = await pinSecondaryProviders(CID, {
    providers: [
      {
        name: 'transport',
        pin: async () => {
          attempts += 1
          if (attempts === 1) throw new TypeError('fetch failed')
          return { status: 'pinned' }
        },
      },
    ],
    pollMs: 0,
  })

  assert.equal(attempts, 2)
  assert.equal(result.results[0].status, 'pinned')
})

test('aborts a provider request at the configured deadline', async () => {
  let signal
  const result = await pinSecondaryProviders(CID, {
    providers: [
      {
        name: 'hanging',
        pin: (_cid, options) => {
          signal = options.signal
          return new Promise(() => {})
        },
      },
    ],
    timeoutMs: 10,
    pollMs: 0,
  })

  assert.equal(result.results[0].status, 'timeout')
  assert.equal(signal.aborted, true)
})

test('caps the final polling delay at the remaining deadline', async () => {
  let now = 0
  let observedSleep
  const result = await pinSecondaryProviders(CID, {
    providers: [{ name: 'pending', pin: async () => ({ status: 'pending' }) }],
    timeoutMs: 100,
    pollMs: 30,
    now: () => now,
    sleep: async (ms) => {
      observedSleep = ms
      now += ms
    },
  })

  assert.equal(observedSleep, 10)
  assert.equal(result.results[0].status, 'timeout')
})
