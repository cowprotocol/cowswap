import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { runNode, runScriptAsync, startMockCloudflare } from './test-utils.mjs'

describe('create-pages-project.mjs', () => {
  it('prints the dry-run Cloudflare Pages project payload', () => {
    const result = runNode([
      'tools/scripts/cf-pages/create-pages-project.mjs',
      'demo-project',
      'main',
      '--dry-run',
      '--path-include',
      'apps/cowswap-frontend/*',
    ])

    assert.equal(result.status, 0)

    const payload = JSON.parse(result.stdout)
    assert.equal(payload.name, 'demo-project')
    assert.equal(payload.production_branch, 'main')
    assert.deepEqual(payload.source.config.path_includes, ['apps/cowswap-frontend/*'])
  })

  it('rejects option-like tokens when an option value is required', () => {
    const result = runNode([
      'tools/scripts/cf-pages/create-pages-project.mjs',
      '--dry-run',
      '--project-name',
      '--branch',
      'main',
    ])

    assert.equal(result.status, 1)
    assert.match(result.stderr, /ERROR: --project-name requires a value/)
  })

  it('posts project creation payload to Cloudflare when not in dry-run mode', async (t) => {
    const cloudflare = await startMockCloudflare([
      {
        method: 'POST',
        url: '/client/v4/accounts/account-id/pages/projects',
        response: { body: { success: true, result: { subdomain: 'demo.pages.dev' } } },
      },
    ])
    t.after(() => cloudflare.close())

    const result = await runScriptAsync(
      'tools/scripts/cf-pages/create-pages-project.mjs',
      [
        '--project-name',
        'demo-project',
        '--branch',
        'main',
        '--repo-owner',
        'cowprotocol',
        '--repo-name',
        'cowswap',
        '--build-caching',
        'false',
      ],
      { CF_ACCOUNT_ID: 'account-id', CF_API_TOKEN: 'api-token', CF_API_BASE: cloudflare.apiBase },
    )

    assert.equal(result.status, 0)
    assert.equal(cloudflare.requests.length, 1)
    assert.equal(cloudflare.requests[0].headers.authorization, 'Bearer api-token')
    assert.equal(cloudflare.requests[0].json.name, 'demo-project')
    assert.equal(cloudflare.requests[0].json.production_branch, 'main')
    assert.equal(cloudflare.requests[0].json.build_config.build_caching, false)
    assert.match(result.stdout, /Done\. Project created: https:\/\/demo\.pages\.dev/)
  })
})
