import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { cfFetch } from './cf-api.mjs'
import { startMockCloudflare } from './test-utils.mjs'

describe('cf-api', () => {
  it('sends Cloudflare auth headers and parses successful JSON responses', async (t) => {
    const cloudflare = await startMockCloudflare([
      {
        method: 'GET',
        url: '/client/v4/accounts/account-id/pages/projects',
        response: { body: { success: true, result: { ok: true } } },
      },
    ])
    t.after(() => cloudflare.close())

    process.env.CF_API_BASE = cloudflare.apiBase
    t.after(() => {
      delete process.env.CF_API_BASE
    })

    const data = await cfFetch('account-id', 'api-token', 'projects')

    assert.deepEqual(data.result, { ok: true })
    assert.equal(cloudflare.requests[0].headers.authorization, 'Bearer api-token')
    assert.equal(cloudflare.requests[0].headers['content-type'], 'application/json')
  })

  it('throws Cloudflare API errors from unsuccessful responses', async (t) => {
    const cloudflare = await startMockCloudflare([
      {
        method: 'GET',
        url: '/client/v4/accounts/account-id/pages/projects',
        response: { body: { success: false, errors: [{ message: 'denied' }] } },
      },
    ])
    t.after(() => cloudflare.close())

    process.env.CF_API_BASE = cloudflare.apiBase
    t.after(() => {
      delete process.env.CF_API_BASE
    })

    await assert.rejects(() => cfFetch('account-id', 'api-token', 'projects'), /Cloudflare API error/)
  })
})
