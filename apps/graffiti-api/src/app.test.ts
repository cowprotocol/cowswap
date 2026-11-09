import { Keypair } from '@solana/web3.js'

import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, test } from 'node:test'

import { buildServer, type BuiltServer } from './app.js'
import { type Config, loadConfig } from './config.js'
import { JsonStore } from './jsonStore.js'

import type { LightMyRequestResponse } from 'fastify'

const WALLET = Keypair.generate().publicKey.toBase58()
const ADMIN = 'test-admin-token'

let built: BuiltServer | null = null

async function start(overrides: Partial<Config> = {}): Promise<BuiltServer> {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'graffiti-app-'))
  const store = new JsonStore(path.join(dir, 'test.db'))
  const config: Config = {
    ...loadConfig(),
    devInsecure: true,
    adminToken: null,
    rateLimitPerMinute: 1000,
    ...overrides,
  }
  built = await buildServer(config, store, { logger: false })
  return built
}

afterEach(async () => {
  await built?.close()
  built = null
})

const cell = (x: number, y: number, color = 0xff0000): Record<string, number> => ({ x, y, color })

const draw = (server: BuiltServer, body: Record<string, unknown>): Promise<LightMyRequestResponse> =>
  server.app.inject({ method: 'POST', url: '/v1/draw', payload: body })

describe('admin endpoints', () => {
  test('are disabled, not open, when ADMIN_TOKEN is unset', async () => {
    const server = await start({ adminToken: null })
    const res = await server.app.inject({ method: 'POST', url: '/v1/admin/claims', payload: { n: 5 } })
    assert.equal(res.statusCode, 503)
  })

  test('reject a wrong token', async () => {
    const server = await start({ adminToken: ADMIN })
    const res = await server.app.inject({
      method: 'POST',
      url: '/v1/admin/claims',
      headers: { authorization: 'Bearer wrong' },
      payload: { n: 1 },
    })
    assert.equal(res.statusCode, 401)
  })

  test('generate codes with the right token', async () => {
    const server = await start({ adminToken: ADMIN })
    const res = await server.app.inject({
      method: 'POST',
      url: '/v1/admin/claims',
      headers: { authorization: `Bearer ${ADMIN}` },
      payload: { n: 3, amount: 500 },
    })
    const body = res.json() as { ok: boolean; codes: Array<{ code: string; amount: number }> }
    assert.equal(res.statusCode, 200)
    assert.equal(body.codes.length, 3)
    assert.ok(body.codes.every((c) => c.code.length === 22 && c.amount === 500))
  })

  test('clamp an absurd request size', async () => {
    const server = await start({ adminToken: ADMIN })
    const res = await server.app.inject({
      method: 'POST',
      url: '/v1/admin/claims',
      headers: { authorization: `Bearer ${ADMIN}` },
      payload: { n: 1_000_000 },
    })
    assert.equal((res.json() as { codes: unknown[] }).codes.length, 1000)
  })

  test('the failed-claims listing is admin-only too', async () => {
    const server = await start({ adminToken: ADMIN })
    assert.equal((await server.app.inject({ method: 'GET', url: '/v1/admin/claims/failed' })).statusCode, 401)
    const ok = await server.app.inject({
      method: 'GET',
      url: '/v1/admin/claims/failed',
      headers: { authorization: `Bearer ${ADMIN}` },
    })
    assert.equal(ok.statusCode, 200)
  })
})

describe('POST /v1/draw', () => {
  test('applies a draw and exposes it through /v1/cells', async () => {
    const server = await start()
    const res = await draw(server, { walletPubkey: WALLET, txSignature: 'd1', cells: [cell(10, 10), cell(11, 10)] })
    assert.equal(res.statusCode, 200)
    assert.deepEqual(res.json(), { ok: true, seq: 1 })

    const cells = (await server.app.inject({ method: 'GET', url: '/v1/cells?since=0' })).json() as {
      cells: number[][]
      hasMore: boolean
    }
    assert.deepEqual(cells.cells, [
      [10, 10, 0xff0000],
      [11, 10, 0xff0000],
    ])
    assert.equal(cells.hasMore, false)
  })

  test('rejects a replayed signature', async () => {
    const server = await start()
    await draw(server, { walletPubkey: WALLET, txSignature: 'replay', cells: [cell(1, 1)] })
    const again = await draw(server, { walletPubkey: WALLET, txSignature: 'replay', cells: [cell(2, 2)] })
    assert.equal(again.statusCode, 400)
    assert.equal((again.json() as { reason: string }).reason, 'signature already used')
  })

  test('rejects an oversized bounding box', async () => {
    const server = await start()
    const res = await draw(server, { walletPubkey: WALLET, txSignature: 'big', cells: [cell(0, 0), cell(900, 900)] })
    assert.equal(res.statusCode, 400)
    assert.match((res.json() as { reason: string }).reason, /too large/)
  })

  test('requires a wallet', async () => {
    const server = await start()
    assert.equal((await draw(server, { cells: [cell(1, 1)] })).statusCode, 400)
  })

  test('caps the number of cells per draw', async () => {
    const server = await start({ maxCellsPerDraw: 2 })
    const res = await draw(server, {
      walletPubkey: WALLET,
      txSignature: 'cap',
      cells: [cell(1, 1), cell(2, 1), cell(3, 1)],
    })
    assert.equal(res.statusCode, 400)
    assert.match((res.json() as { reason: string }).reason, /too many cells/)
  })

  test('a failure applying the draw hands the burn back and does not leak the cause', async () => {
    const server = await start()
    server.ctx.canvas.applyDraw = () => {
      throw new Error('disk exploded at /var/secret/path')
    }
    const res = await draw(server, { walletPubkey: WALLET, txSignature: 'boom', cells: [cell(5, 5)] })
    assert.equal(res.statusCode, 500)
    assert.equal((res.json() as { retryable: boolean }).retryable, true)
    assert.doesNotMatch(res.body, /secret/)
    assert.equal(server.ctx.store.claimSignature('boom'), true, 'the signature must be free for a retry')
  })
})

describe('GET /v1/cells paging', () => {
  test('reports hasMore until the client has everything', async () => {
    const server = await start()
    await draw(server, { walletPubkey: WALLET, txSignature: 'p1', cells: [cell(1, 1), cell(2, 1), cell(3, 1)] })

    const first = (await server.app.inject({ method: 'GET', url: '/v1/cells?since=0&limit=2' })).json() as {
      cells: unknown[]
      hasMore: boolean
    }
    assert.equal(first.cells.length, 2)
    assert.equal(first.hasMore, true)
  })
})

describe('GET /v1/canvas.png', () => {
  test('is cached by revision and answers conditional requests', async () => {
    const server = await start()
    const first = await server.app.inject({ method: 'GET', url: '/v1/canvas.png' })
    const etag = String(first.headers.etag)
    assert.equal(first.statusCode, 200)
    assert.equal(first.headers['content-type'], 'image/png')

    const cached = await server.app.inject({ method: 'GET', url: '/v1/canvas.png', headers: { 'if-none-match': etag } })
    assert.equal(cached.statusCode, 304)

    await draw(server, { walletPubkey: WALLET, txSignature: 'png1', cells: [cell(3, 3)] })
    const after = await server.app.inject({ method: 'GET', url: '/v1/canvas.png', headers: { 'if-none-match': etag } })
    assert.equal(after.statusCode, 200, 'a draw must invalidate the cached render')
    assert.notEqual(after.headers.etag, etag)
  })
})

describe('rate limiting', () => {
  test('returns 429 with Retry-After once the budget is spent', async () => {
    const server = await start({ rateLimitPerMinute: 3 })
    const statuses: number[] = []
    let last: LightMyRequestResponse | null = null
    for (let i = 0; i < 5; i++) {
      last = await server.app.inject({ method: 'POST', url: '/v1/claim', payload: {} })
      statuses.push(last.statusCode)
    }
    assert.deepEqual(statuses, [400, 400, 400, 429, 429])
    assert.ok(Number(last?.headers['retry-after']) >= 1)
  })
})

describe('claim flow over HTTP', () => {
  test('a code is redeemable exactly once', async () => {
    const server = await start()
    server.ctx.store.insertClaim('http-code', 1000)

    const claim = (): Promise<LightMyRequestResponse> =>
      server.app.inject({ method: 'POST', url: '/v1/claim', payload: { code: 'http-code', walletPubkey: WALLET } })

    assert.equal((await claim()).statusCode, 200)
    assert.equal((await claim()).statusCode, 400)
    const status = (await server.app.inject({ method: 'GET', url: '/v1/claim/http-code' })).json()
    assert.deepEqual(status, { valid: false, amount: 0 })
  })
})

describe('CORS', () => {
  test('echoes only an allowed origin when origins are configured', async () => {
    const server = await start({ corsOrigins: ['https://wall.example'] })
    const allowed = await server.app.inject({
      method: 'GET',
      url: '/health',
      headers: { origin: 'https://wall.example' },
    })
    const blocked = await server.app.inject({
      method: 'GET',
      url: '/health',
      headers: { origin: 'https://evil.example' },
    })
    assert.equal(allowed.headers['access-control-allow-origin'], 'https://wall.example')
    assert.equal(blocked.headers['access-control-allow-origin'], undefined)
  })
})

describe('buildServer', () => {
  test('refuses to start without a mint and treasury unless dev-insecure', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'graffiti-app-'))
    const store = new JsonStore(path.join(dir, 'test.db'))
    const config: Config = { ...loadConfig(), devInsecure: false, mint: null, treasurySecretKey: null }
    await assert.rejects(() => buildServer(config, store, { logger: false }), /MINT and a treasury key/)
  })
})
