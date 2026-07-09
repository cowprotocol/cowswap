import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { runScriptAsync, startMockCloudflare } from './test-utils.mjs'

describe('report-build-usage.mjs', () => {
  it('falls back to a working concurrency when --concurrency is invalid', async (t) => {
    const cloudflare = await startMockCloudflare([
      {
        method: 'GET',
        url: '/client/v4/accounts/account-id/pages/projects?page=1',
        response: { body: { success: true, result: [{ name: 'demo-project' }] } },
      },
      {
        method: 'GET',
        url: '/client/v4/accounts/account-id/pages/projects?page=2',
        response: { body: { success: true, result: [] } },
      },
      {
        method: 'GET',
        url: '/client/v4/accounts/account-id/pages/projects/demo-project/deployments?page=1',
        response: {
          body: {
            success: true,
            result_info: { total_pages: 1 },
            result: [
              { created_on: new Date().toISOString(), is_skipped: false },
              { created_on: new Date().toISOString(), is_skipped: true },
            ],
          },
        },
      },
    ])
    t.after(() => cloudflare.close())

    const result = await runScriptAsync(
      'tools/scripts/cf-pages/report-build-usage.mjs',
      ['--concurrency=0'],
      { CF_ACCOUNT_ID: 'account-id', CF_API_TOKEN: 'api-token', CF_API_BASE: cloudflare.apiBase },
    )

    assert.equal(result.status, 0)
    assert.deepEqual(
      cloudflare.requests.map((request) => request.url),
      [
        '/client/v4/accounts/account-id/pages/projects?page=1',
        '/client/v4/accounts/account-id/pages/projects?page=2',
        '/client/v4/accounts/account-id/pages/projects/demo-project/deployments?page=1',
      ],
    )
    assert.match(result.stdout, /ACCOUNT BUILD USAGE: 1 \/ 500/)
  })
})
