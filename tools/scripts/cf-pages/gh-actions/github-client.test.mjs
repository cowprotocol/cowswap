import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { GitHubApiError, createGitHubClient, isNotFoundError } from './github-client.mjs'

describe('github-client', () => {
  it('sends authenticated GitHub REST requests for repository operations', async () => {
    const originalFetch = globalThis.fetch
    const requests = []
    globalThis.fetch = async (url, options) => {
      requests.push({ options, url })

      return {
        ok: true,
        status: 200,
        async text() {
          return JSON.stringify({ permission: 'write' })
        },
      }
    }

    try {
      const client = createGitHubClient({
        apiBase: 'https://api.github.test',
        repoFullName: 'cowprotocol/cowswap',
        token: 'github-token',
      })

      const permission = await client.getCollaboratorPermission('maintainer')

      assert.equal(permission, 'write')
      assert.equal(
        requests[0].url,
        'https://api.github.test/repos/cowprotocol/cowswap/collaborators/maintainer/permission',
      )
      assert.equal(requests[0].options.method, 'GET')
      assert.equal(requests[0].options.headers.Authorization, 'Bearer github-token')
      assert.equal(requests[0].options.headers.Accept, 'application/vnd.github+json')
    } finally {
      globalThis.fetch = originalFetch
    }
  })

  it('throws GitHubApiError with API response messages', async () => {
    const originalFetch = globalThis.fetch
    globalThis.fetch = async () => {
      return {
        ok: false,
        status: 403,
        async text() {
          return JSON.stringify({ message: 'Resource not accessible by integration' })
        },
      }
    }

    try {
      const client = createGitHubClient({
        apiBase: 'https://api.github.test',
        repoFullName: 'cowprotocol/cowswap',
        token: 'github-token',
      })

      await assert.rejects(
        client.getPullRequest(123),
        (error) =>
          error instanceof GitHubApiError &&
          error.status === 403 &&
          error.message === 'Resource not accessible by integration',
      )
    } finally {
      globalThis.fetch = originalFetch
    }
  })

  it('identifies GitHub 404 errors', () => {
    assert.equal(isNotFoundError(new GitHubApiError(404, 'Not Found')), true)
    assert.equal(isNotFoundError(new GitHubApiError(500, 'Server Error')), false)
  })
})
