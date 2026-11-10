import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, test } from 'node:test'

import { loadConfig } from './config.js'

const KEYS = [
  'NETWORK',
  'NODE_ENV',
  'DEV_INSECURE',
  'ALLOW_JSON_STORE',
  'CORS_ORIGINS',
  'ADMIN_TOKEN',
  'VERIFY_COMMITMENT',
  'PORT',
  'MINT',
]

let saved: Record<string, string | undefined> = {}

beforeEach(() => {
  saved = Object.fromEntries(KEYS.map((k) => [k, process.env[k]]))
  for (const k of KEYS) delete process.env[k]
})

afterEach(() => {
  for (const k of KEYS) {
    if (saved[k] === undefined) delete process.env[k]
    else process.env[k] = saved[k]
  }
})

describe('loadConfig', () => {
  test('defaults are the safe development setup', () => {
    const config = loadConfig()
    assert.equal(config.network, 'devnet')
    assert.equal(config.port, 3199)
    assert.equal(config.devInsecure, false)
    assert.equal(config.verifyCommitment, 'finalized')
    assert.equal(config.adminToken, null)
    assert.deepEqual(config.corsOrigins, ['*'])
  })

  test('refuses DEV_INSECURE on mainnet', () => {
    process.env.NETWORK = 'mainnet'
    process.env.DEV_INSECURE = '1'
    process.env.CORS_ORIGINS = 'https://wall.example'
    assert.throws(() => loadConfig(), /DEV_INSECURE/)
  })

  test('refuses DEV_INSECURE under NODE_ENV=production on any network', () => {
    process.env.NODE_ENV = 'production'
    process.env.DEV_INSECURE = '1'
    process.env.CORS_ORIGINS = 'https://wall.example'
    assert.throws(() => loadConfig(), /DEV_INSECURE/)
  })

  test('refuses the JSON store on mainnet', () => {
    process.env.NETWORK = 'mainnet-beta'
    process.env.ALLOW_JSON_STORE = '1'
    process.env.CORS_ORIGINS = 'https://wall.example'
    assert.throws(() => loadConfig(), /ALLOW_JSON_STORE/)
  })

  test('requires explicit CORS origins on mainnet', () => {
    process.env.NETWORK = 'mainnet'
    assert.throws(() => loadConfig(), /CORS_ORIGINS/)
  })

  test('accepts a properly configured mainnet setup', () => {
    process.env.NETWORK = 'mainnet'
    process.env.CORS_ORIGINS = 'https://a.example, https://b.example'
    const config = loadConfig()
    assert.deepEqual(config.corsOrigins, ['https://a.example', 'https://b.example'])
  })

  test('only an explicit "confirmed" weakens the verification commitment', () => {
    process.env.VERIFY_COMMITMENT = 'processed'
    assert.equal(loadConfig().verifyCommitment, 'finalized')
    process.env.VERIFY_COMMITMENT = 'confirmed'
    assert.equal(loadConfig().verifyCommitment, 'confirmed')
  })

  test('an empty variable falls back to its default', () => {
    process.env.PORT = ''
    process.env.ADMIN_TOKEN = ''
    const config = loadConfig()
    assert.equal(config.port, 3199)
    assert.equal(config.adminToken, null, 'an empty ADMIN_TOKEN must not enable admin with an empty secret')
  })
})
