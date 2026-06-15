import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { buildPreviewCommentBody } from './preview-mirror-comment.mjs'
import { buildPreviewBranch, handlePreviewMirrorEvent } from './preview-mirror-lib.mjs'

const SOURCE_SHA = 'abc1234567890abcdef1234567890abcdef12345'
const NEXT_SOURCE_SHA = 'def4567890abcdef1234567890abcdef12345678'
const APPROVED_SOURCE_SHA = '1111111111111111111111111111111111111111'

function forkPullRequest(overrides = {}) {
  return {
    base: {
      ref: 'develop',
      repo: {
        full_name: 'cowprotocol/cowswap',
      },
    },
    head: {
      ref: 'feature/new-swap',
      repo: {
        full_name: 'external/cowswap',
      },
      sha: SOURCE_SHA,
    },
    html_url: 'https://github.com/cowprotocol/cowswap/pull/123',
    number: 123,
    state: 'open',
    ...overrides,
  }
}

function labeledEvent(labelName = 'trigger-preview') {
  return {
    action: 'labeled',
    label: { name: labelName },
    pull_request: forkPullRequest(),
  }
}

function checkboxEvent(body, issueNumber = 123) {
  return {
    action: 'edited',
    comment: {
      body,
      id: 777,
    },
    issue: {
      number: issueNumber,
      pull_request: {},
    },
  }
}

function synchronizeEvent(pullRequest = forkPullRequest()) {
  return {
    action: 'synchronize',
    pull_request: pullRequest,
  }
}

function createFakeClient({ comments = [], permission = 'write', pullRequest = forkPullRequest(), refExists = false } = {}) {
  const calls = []
  const storedComments = [...comments]
  let mirrorPullRequest = null
  let hasRef = refExists

  return {
    calls,
    async addIssueLabels(issueNumber, labels) {
      calls.push(['addIssueLabels', issueNumber, labels])
    },
    async closePullRequest(prNumber) {
      calls.push(['closePullRequest', prNumber])
      if (mirrorPullRequest?.number === prNumber) {
        mirrorPullRequest = { ...mirrorPullRequest, state: 'closed' }
      }
      return mirrorPullRequest
    },
    async createIssueComment(issueNumber, body) {
      calls.push(['createIssueComment', issueNumber, body])
      storedComments.push({ body, id: 999, user: { type: 'Bot' } })
      return { id: 999 }
    },
    async createPullRequest(payload) {
      calls.push(['createPullRequest', payload])
      mirrorPullRequest = {
        body: payload.body,
        draft: payload.draft,
        head: { ref: payload.head },
        html_url: 'https://github.com/cowprotocol/cowswap/pull/456',
        number: 456,
        state: 'open',
        title: payload.title,
      }
      return mirrorPullRequest
    },
    async createRef(branchName, sha) {
      calls.push(['createRef', branchName, sha])
      hasRef = true
    },
    async deleteRef(branchName) {
      calls.push(['deleteRef', branchName])
      hasRef = false
    },
    async getCollaboratorPermission(username) {
      calls.push(['getCollaboratorPermission', username])
      return permission
    },
    async getPullRequest(prNumber) {
      calls.push(['getPullRequest', prNumber])
      return pullRequest
    },
    async getPullRequestByHead(branchName) {
      calls.push(['getPullRequestByHead', branchName])
      return mirrorPullRequest?.head.ref === branchName ? mirrorPullRequest : null
    },
    async getRef(branchName) {
      calls.push(['getRef', branchName])
      if (!hasRef) {
        const error = new Error('not found')
        error.status = 404
        throw error
      }
      return { object: { sha: 'oldsha' } }
    },
    async findIssueComment(issueNumber, predicate) {
      calls.push(['findIssueComment', issueNumber])
      return storedComments.find(predicate) ?? null
    },
    async removeIssueLabel(issueNumber, labelName) {
      calls.push(['removeIssueLabel', issueNumber, labelName])
    },
    async updateIssueComment(commentId, body) {
      calls.push(['updateIssueComment', commentId, body])
      const storedComment = storedComments.find((comment) => comment.id === commentId)
      if (storedComment) {
        storedComment.body = body
      }
      return { id: commentId }
    },
    async updatePullRequest(prNumber, payload) {
      calls.push(['updatePullRequest', prNumber, payload])
      mirrorPullRequest = {
        ...mirrorPullRequest,
        ...payload,
        number: prNumber,
        state: payload.state ?? mirrorPullRequest?.state ?? 'open',
      }
      return mirrorPullRequest
    },
    async updateRef(branchName, sha) {
      calls.push(['updateRef', branchName, sha])
      hasRef = true
    },
  }
}

describe('preview-mirror-lib', () => {
  it('builds stable Cloudflare preview branch names from PR numbers', () => {
    assert.equal(buildPreviewBranch(123), 'cf-preview/pr-123')
  })

  it('creates a preview branch, comments on the original PR, and removes the trigger label', async () => {
    const client = createFakeClient()

    const result = await handlePreviewMirrorEvent({
      actor: 'maintainer',
      client,
      event: labeledEvent(),
      now: new Date('2026-06-05T10:30:00.000Z'),
      options: {
        repoFullName: 'cowprotocol/cowswap',
      },
    })

    assert.deepEqual(result, {
      branchName: 'cf-preview/pr-123',
      mirrorPullRequestNumber: 456,
      status: 'synced',
    })
    assert.deepEqual(
      client.calls.map((call) => call.slice(0, 2)),
      [
        ['getCollaboratorPermission', 'maintainer'],
        ['getRef', 'cf-preview/pr-123'],
        ['createRef', 'cf-preview/pr-123'],
        ['getPullRequestByHead', 'cf-preview/pr-123'],
        ['createPullRequest', {
          base: 'develop',
          body: [
            '<!-- cf-pages-preview-mirror original-pr=123 -->',
            'This PR mirrors fork PR #123 for Cloudflare Pages preview builds.',
            '',
            'Source PR: https://github.com/cowprotocol/cowswap/pull/123',
            'Source fork branch: `external/cowswap:feature/new-swap`',
            'Mirrored SHA: `abc123456789`',
            '',
            'Do not merge this PR. Close the source PR to clean up this mirror.',
          ].join('\n'),
          draft: true,
          head: 'cf-preview/pr-123',
          title: 'preview: mirror fork PR #123',
        }],
        ['addIssueLabels', 456],
        ['findIssueComment', 123],
        ['createIssueComment', 123],
        ['removeIssueLabel', 123],
      ],
    )
    const labelCall = client.calls.find((call) => call[0] === 'addIssueLabels')
    assert.deepEqual(labelCall, ['addIssueLabels', 456, ['DONT_MERGE']])
  })

  it('force-updates an existing preview branch when a checked managed comment is edited', async () => {
    const checkedComment = buildPreviewCommentBody({
      actor: 'maintainer',
      branchName: 'cf-preview/pr-123',
      mirrorPullRequestNumber: 456,
      mirrorPullRequestUrl: 'https://github.com/cowprotocol/cowswap/pull/456',
      now: new Date('2026-06-05T10:30:00.000Z'),
      originalPrNumber: 123,
      repoFullName: 'cowprotocol/cowswap',
      sourceBranch: 'feature/new-swap',
      sourceRepoFullName: 'external/cowswap',
      sourceSha: APPROVED_SOURCE_SHA,
    }).replace('- [ ] Sync Cloudflare preview', '- [x] Sync Cloudflare preview')
    const client = createFakeClient({
      pullRequest: forkPullRequest({
        head: {
          ref: 'feature/new-swap',
          repo: {
            full_name: 'external/cowswap',
          },
          sha: NEXT_SOURCE_SHA,
        },
      }),
      refExists: true,
    })

    const result = await handlePreviewMirrorEvent({
      actor: 'maintainer',
      client,
      event: checkboxEvent(checkedComment),
      now: new Date('2026-06-05T10:45:00.000Z'),
      options: {
        repoFullName: 'cowprotocol/cowswap',
      },
    })

    assert.deepEqual(result, {
      branchName: 'cf-preview/pr-123',
      mirrorPullRequestNumber: 456,
      status: 'synced',
    })
    assert.deepEqual(
      client.calls.map((call) => call.slice(0, 2)),
      [
        ['getCollaboratorPermission', 'maintainer'],
        ['getPullRequest', 123],
        ['getRef', 'cf-preview/pr-123'],
        ['updateRef', 'cf-preview/pr-123'],
        ['getPullRequestByHead', 'cf-preview/pr-123'],
        ['createPullRequest', {
          base: 'develop',
          body: [
            '<!-- cf-pages-preview-mirror original-pr=123 -->',
            'This PR mirrors fork PR #123 for Cloudflare Pages preview builds.',
            '',
            'Source PR: https://github.com/cowprotocol/cowswap/pull/123',
            'Source fork branch: `external/cowswap:feature/new-swap`',
            'Mirrored SHA: `111111111111`',
            '',
            'Do not merge this PR. Close the source PR to clean up this mirror.',
          ].join('\n'),
          draft: true,
          head: 'cf-preview/pr-123',
          title: 'preview: mirror fork PR #123',
        }],
        ['addIssueLabels', 456],
        ['updateIssueComment', 777],
      ],
    )
    const updateRefCall = client.calls.find((call) => call[0] === 'updateRef')
    assert.deepEqual(updateRefCall, ['updateRef', 'cf-preview/pr-123', APPROVED_SOURCE_SHA])
    const updateCall = client.calls.find((call) => call[0] === 'updateIssueComment')
    assert.match(updateCall[2], /Approval target SHA: `def4567890ab`/)
    assert.match(updateCall[2], /Last mirrored SHA: `111111111111`/)
    assert.match(updateCall[2], /- \[ \] Sync Cloudflare preview to approval target commit/)
  })

  it('updates an existing mirror pull request without adding labels', async () => {
    const client = createFakeClient({ refExists: true })
    await client.createPullRequest({
      base: 'develop',
      body: 'old body',
      draft: false,
      head: 'cf-preview/pr-123',
      title: 'preview: mirror fork PR #123',
    })
    client.calls.length = 0

    const result = await handlePreviewMirrorEvent({
      actor: 'maintainer',
      client,
      event: labeledEvent(),
      now: new Date('2026-06-05T10:45:00.000Z'),
      options: {
        repoFullName: 'cowprotocol/cowswap',
      },
    })

    assert.deepEqual(result, {
      branchName: 'cf-preview/pr-123',
      mirrorPullRequestNumber: 456,
      status: 'synced',
    })
    assert.deepEqual(
      client.calls.map((call) => call.slice(0, 2)),
      [
        ['getCollaboratorPermission', 'maintainer'],
        ['getRef', 'cf-preview/pr-123'],
        ['updateRef', 'cf-preview/pr-123'],
        ['getPullRequestByHead', 'cf-preview/pr-123'],
        ['updatePullRequest', 456],
        ['findIssueComment', 123],
        ['createIssueComment', 123],
        ['removeIssueLabel', 123],
      ],
    )
  })

  it('refreshes the approval target comment on fork PR synchronize without mirroring code', async () => {
    const existingComment = buildPreviewCommentBody({
      actor: 'maintainer',
      branchName: 'cf-preview/pr-123',
      mirrorPullRequestNumber: 456,
      mirrorPullRequestUrl: 'https://github.com/cowprotocol/cowswap/pull/456',
      now: new Date('2026-06-05T10:30:00.000Z'),
      originalPrNumber: 123,
      repoFullName: 'cowprotocol/cowswap',
      sourceBranch: 'feature/new-swap',
      sourceRepoFullName: 'external/cowswap',
      sourceSha: SOURCE_SHA,
    })
    const client = createFakeClient({
      comments: [{ body: existingComment, id: 999, user: { type: 'Bot' } }],
      refExists: true,
    })
    await client.createPullRequest({
      base: 'develop',
      body: 'old body',
      draft: true,
      head: 'cf-preview/pr-123',
      title: 'preview: mirror fork PR #123',
    })
    client.calls.length = 0

    const result = await handlePreviewMirrorEvent({
      actor: 'external-contributor',
      client,
      event: synchronizeEvent(
        forkPullRequest({
          head: {
            ref: 'feature/new-swap',
            repo: {
              full_name: 'external/cowswap',
            },
            sha: NEXT_SOURCE_SHA,
          },
        }),
      ),
      now: new Date('2026-06-05T10:45:00.000Z'),
      options: {
        repoFullName: 'cowprotocol/cowswap',
      },
    })

    assert.deepEqual(result, {
      branchName: 'cf-preview/pr-123',
      status: 'approval-target-updated',
    })
    assert.deepEqual(
      client.calls.map((call) => call.slice(0, 2)),
      [
        ['findIssueComment', 123],
        ['getPullRequestByHead', 'cf-preview/pr-123'],
        ['updateIssueComment', 999],
      ],
    )
    const updateCall = client.calls.find((call) => call[0] === 'updateIssueComment')
    assert.match(updateCall[2], /Approval target SHA: `def4567890ab`/)
    assert.match(updateCall[2], /Last mirrored SHA: `abc123456789`/)
    assert.match(updateCall[2], /- \[ \] Sync Cloudflare preview to approval target commit/)
  })

  it('ignores checked managed comments edited on a different pull request issue', async () => {
    const checkedComment = buildPreviewCommentBody({
      actor: 'maintainer',
      branchName: 'cf-preview/pr-123',
      mirrorPullRequestNumber: 456,
      mirrorPullRequestUrl: 'https://github.com/cowprotocol/cowswap/pull/456',
      now: new Date('2026-06-05T10:30:00.000Z'),
      originalPrNumber: 123,
      repoFullName: 'cowprotocol/cowswap',
      sourceBranch: 'feature/new-swap',
      sourceRepoFullName: 'external/cowswap',
      sourceSha: SOURCE_SHA,
    }).replace('- [ ] Sync Cloudflare preview', '- [x] Sync Cloudflare preview')
    const client = createFakeClient({ refExists: true })

    const result = await handlePreviewMirrorEvent({
      actor: 'maintainer',
      client,
      event: checkboxEvent(checkedComment, 124),
      now: new Date('2026-06-05T10:45:00.000Z'),
      options: {
        repoFullName: 'cowprotocol/cowswap',
      },
    })

    assert.deepEqual(result, {
      reason: 'managed comment issue does not match original pull request',
      status: 'ignored',
    })
    assert.deepEqual(client.calls, [])
  })

  it('deletes the preview branch when the source fork PR closes', async () => {
    const client = createFakeClient({ refExists: true })
    await client.createPullRequest({
      base: 'develop',
      body: 'old body',
      draft: true,
      head: 'cf-preview/pr-123',
      title: 'preview: mirror fork PR #123',
    })
    client.calls.length = 0

    const result = await handlePreviewMirrorEvent({
      actor: 'external-contributor',
      client,
      event: {
        action: 'closed',
        pull_request: forkPullRequest({ state: 'closed' }),
      },
      now: new Date('2026-06-05T10:45:00.000Z'),
      options: {
        repoFullName: 'cowprotocol/cowswap',
      },
    })

    assert.deepEqual(result, {
      branchName: 'cf-preview/pr-123',
      status: 'deleted',
    })
    assert.deepEqual(client.calls, [
      ['getPullRequestByHead', 'cf-preview/pr-123'],
      ['closePullRequest', 456],
      ['deleteRef', 'cf-preview/pr-123'],
    ])
  })
})
