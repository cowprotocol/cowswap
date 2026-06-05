import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, it } from 'node:test'

import { runScriptAsync, startMockCloudflare } from './test-utils.mjs'

describe('upload-env-vars.mjs', () => {
  it('normalizes CRLF CSV values and builds separate production and preview payloads', async (t) => {
    const dir = mkdtempSync(join(tmpdir(), 'cf-pages-test-'))
    const csvFile = join(dir, 'vars.csv')
    writeFileSync(csvFile, 'REACT_APP_URL,https://example.com\r,text\r\n')

    const cloudflare = await startMockCloudflare([
      {
        method: 'GET',
        url: '/client/v4/accounts/account-id/pages/projects/demo-project',
        response: {
          body: {
            success: true,
            result: {
              deployment_configs: {
                production: { env_vars: { REACT_APP_URL: {} } },
                preview: { env_vars: {} },
              },
            },
          },
        },
      },
      {
        method: 'PATCH',
        url: '/client/v4/accounts/account-id/pages/projects/demo-project',
        response: { body: { success: true, result: {} } },
      },
    ])
    t.after(() => cloudflare.close())

    const result = await runScriptAsync(
      'tools/scripts/cf-pages/upload-env-vars.mjs',
      [csvFile, '--project', 'demo-project', '--env', 'both'],
      { CF_ACCOUNT_ID: 'account-id', CF_API_TOKEN: 'api-token', CF_API_BASE: cloudflare.apiBase },
    )

    assert.equal(result.status, 0)

    const patchRequest = cloudflare.requests.find((request) => request.method === 'PATCH')
    assert.ok(patchRequest)

    const payload = patchRequest.json
    assert.deepEqual(payload.deployment_configs.production.env_vars, {})
    assert.equal(payload.deployment_configs.preview.env_vars.REACT_APP_URL.value, 'https://example.com')
    assert.equal(payload.deployment_configs.preview.env_vars.REACT_APP_URL.type, 'plain_text')
  })
})
