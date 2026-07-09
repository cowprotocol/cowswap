import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { runScriptAsync, startMockCloudflare } from './test-utils.mjs'

describe('rollback-production-deployment.mjs', () => {
  it('posts to the Cloudflare deployment rollback endpoint', async (t) => {
    const cloudflare = await startMockCloudflare([
      {
        method: 'POST',
        url: '/client/v4/accounts/account-id/pages/projects/demo-project/deployments/deployment-id/rollback',
        response: { body: { success: true, result: { id: 'deployment-id', url: 'https://rollback.pages.dev' } } },
      },
    ])
    t.after(() => cloudflare.close())

    const result = await runScriptAsync(
      'tools/scripts/cf-pages/rollback-production-deployment.mjs',
      ['demo-project', 'deployment-id'],
      { CF_ACCOUNT_ID: 'account-id', CF_API_TOKEN: 'api-token', CF_API_BASE: cloudflare.apiBase },
    )

    assert.equal(result.status, 0)
    assert.equal(cloudflare.requests[0].method, 'POST')
    assert.equal(
      cloudflare.requests[0].url,
      '/client/v4/accounts/account-id/pages/projects/demo-project/deployments/deployment-id/rollback',
    )
    assert.match(result.stdout, /Done\. Production rolled back to deployment: deployment-id/)
  })
})
