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

  it('finds issue comments beyond the first page', async () => {
    const originalFetch = globalThis.fetch
    const requestedUrls = []
    const firstPage = Array.from({ length: 100 }, (_, index) => ({ body: 'other comment', id: index + 1 }))
    const secondPage = [{ body: 'target comment', id: 101 }]

    globalThis.fetch = async (url) => {
      requestedUrls.push(url)
      const body = url.includes('page=2') ? secondPage : firstPage

      return {
        ok: true,
        status: 200,
        async text() {
          return JSON.stringify(body)
        },
      }
    }

    try {
      const client = createGitHubClient({
        apiBase: 'https://api.github.test',
        repoFullName: 'cowprotocol/cowswap',
        token: 'github-token',
      })

      const comment = await client.findIssueComment(123, (issueComment) => issueComment.body === 'target comment')

      assert.deepEqual(comment, secondPage[0])
      assert.deepEqual(
        requestedUrls.map((url) => new URL(url).searchParams.get('page')),
        ['1', '2'],
      )
    } finally {
      globalThis.fetch = originalFetch
    }
  })

  it('stops paging issue comments after finding a match', async () => {
    const originalFetch = globalThis.fetch
    const requestedUrls = []
    const firstPage = [
      { body: 'target comment', id: 1 },
      ...Array.from({ length: 99 }, (_, index) => ({ body: 'other comment', id: index + 2 })),
    ]

    globalThis.fetch = async (url) => {
      requestedUrls.push(url)

      if (url.includes('page=2')) {
        throw new Error('Unexpected second page request')
      }

      return {
        ok: true,
        status: 200,
        async text() {
          return JSON.stringify(firstPage)
        },
      }
    }

    try {
      const client = createGitHubClient({
        apiBase: 'https://api.github.test',
        repoFullName: 'cowprotocol/cowswap',
        token: 'github-token',
      })

      const comment = await client.findIssueComment(123, (issueComment) => issueComment.body === 'target comment')

      assert.deepEqual(comment, firstPage[0])
      assert.deepEqual(
        requestedUrls.map((url) => new URL(url).searchParams.get('page')),
        ['1'],
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
