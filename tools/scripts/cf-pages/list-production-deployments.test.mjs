import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { runScriptAsync, startMockCloudflare } from './test-utils.mjs'

describe('list-production-deployments.mjs', () => {
  it('lists production deployments and marks the current deployment', async (t) => {
    const cloudflare = await startMockCloudflare([
      {
        method: 'GET',
        url: '/client/v4/accounts/account-id/pages/projects/demo-project',
        response: {
          body: {
            success: true,
            result: {
              canonical_deployment: deployment('deploy-current', 'current'),
            },
          },
        },
      },
      {
        method: 'GET',
        url: '/client/v4/accounts/account-id/pages/projects/demo-project/deployments?env=production&per_page=1&page=1',
        response: { body: { success: true, result: [deployment('deploy-current', 'current')] } },
      },
    ])
    t.after(() => cloudflare.close())

    const result = await runScriptAsync(
      'tools/scripts/cf-pages/list-production-deployments.mjs',
      ['demo-project', '--limit', '1'],
      { CF_ACCOUNT_ID: 'account-id', CF_API_TOKEN: 'api-token', CF_API_BASE: cloudflare.apiBase },
    )

    assert.equal(result.status, 0)
    assert.equal(cloudflare.requests.length, 2)
    assert.match(result.stdout, /Fetching project demo-project/)
    assert.match(result.stdout, /2026-05-25 10:15:30/)
    assert.match(result.stdout, /Current production deployment: deploy-current/)
    assert.doesNotMatch(result.stdout, /'current'/)
  })

  it('prints the current production deployment separately when outside the requested list', async (t) => {
    const cloudflare = await startMockCloudflare([
      {
        method: 'GET',
        url: '/client/v4/accounts/account-id/pages/projects/demo-project',
        response: {
          body: {
            success: true,
            result: {
              canonical_deployment: deployment('deploy-current', 'current'),
            },
          },
        },
      },
      {
        method: 'GET',
        url: '/client/v4/accounts/account-id/pages/projects/demo-project/deployments?env=production&per_page=1&page=1',
        response: { body: { success: true, result: [deployment('deploy-old', 'old')] } },
      },
    ])
    t.after(() => cloudflare.close())

    const result = await runScriptAsync(
      'tools/scripts/cf-pages/list-production-deployments.mjs',
      ['demo-project', '1'],
      { CF_ACCOUNT_ID: 'account-id', CF_API_TOKEN: 'api-token', CF_API_BASE: cloudflare.apiBase },
    )

    assert.equal(result.status, 0)
    assert.match(result.stdout, /Current production deployment is outside the listed range/)
    assert.match(result.stdout, /current/)
  })
})

function deployment(id, shortId) {
  return {
    id,
    short_id: shortId,
    created_on: '2026-05-25T10:15:30.123Z',
    deployment_trigger: { metadata: { commit_hash: 'abcdef1234567890' } },
    latest_stage: { name: 'deploy', status: 'success' },
    url: `https://${shortId}.pages.dev`,
  }
}
