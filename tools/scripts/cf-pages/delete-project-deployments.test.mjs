import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { runNode, runScriptAsync, startMockCloudflare } from './test-utils.mjs'

describe('delete-project-deployments.mjs', () => {
  it('prints missing project-name errors to stderr', () => {
    const result = runNode(['tools/scripts/cf-pages/delete-project-deployments.mjs'], {
      env: { CF_ACCOUNT_ID: 'account-id', CF_API_TOKEN: 'api-token', CF_PROJECT_NAME: '' },
    })

    assert.equal(result.status, 1)
    assert.equal(result.stdout, '')
    assert.equal(result.stderr, 'No project name provided. CF_PROJECT_NAME is required')
  })

  it('deletes returned deployments and stops when the next batch is empty', async (t) => {
    const deploymentsUrl = '/client/v4/accounts/account-id/pages/projects/demo-project/deployments'
    const cloudflare = await startMockCloudflare([
      {
        method: 'GET',
        url: deploymentsUrl,
        response: (_request, requests) => {
          const fetchCount = requests.filter((request) => request.method === 'GET' && request.url === deploymentsUrl).length

          return {
            body: {
              success: true,
              result: fetchCount === 1 ? [{ id: 'deployment-1' }] : [],
            },
          }
        },
      },
      {
        method: 'DELETE',
        url: `${deploymentsUrl}/deployment-1`,
        response: { body: { success: true, result: {} } },
      },
    ])
    t.after(() => cloudflare.close())

    const result = await runScriptAsync(
      'tools/scripts/cf-pages/delete-project-deployments.mjs',
      [],
      {
        CF_ACCOUNT_ID: 'account-id',
        CF_API_TOKEN: 'api-token',
        CF_API_BASE: cloudflare.apiBase,
        CF_PROJECT_NAME: 'demo-project',
      },
    )

    assert.equal(result.status, 0)
    assert.ok(cloudflare.requests.some((request) => request.method === 'DELETE' && request.url === `${deploymentsUrl}/deployment-1`))
    assert.match(result.stdout, /No more deployments found/)
  })
})
