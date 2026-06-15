import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { buildPreviewCommentBody, parseManagedPreviewComment } from './preview-mirror-comment.mjs'

const SOURCE_SHA = 'abc1234567890abcdef1234567890abcdef12345'
const APPROVED_SOURCE_SHA = '1111111111111111111111111111111111111111'

describe('preview-mirror-comment', () => {
  it('builds an unchecked sync comment without guessing Cloudflare Pages project URLs', () => {
    const body = buildPreviewCommentBody({
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

    assert.match(
      body,
      /<!-- cf-pages-preview-mirror original-pr=123 target-sha=abc1234567890abcdef1234567890abcdef12345 mirrored-sha=abc1234567890abcdef1234567890abcdef12345 -->/,
    )
    assert.match(body, /`cf-preview\/pr-123`/)
    assert.match(body, /Mirror PR: #456/)
    assert.match(body, /Cloudflare Pages preview links will be posted on the mirror PR/)
    assert.doesNotMatch(body, /pages\.dev/)
    assert.match(body, /Approval target SHA: `abc123456789`/)
    assert.match(body, /Last mirrored SHA: `abc123456789`/)
    assert.match(body, /- \[ \] Sync Cloudflare preview to approval target commit/)
    assert.doesNotMatch(body, /latest fork commit/)
  })

  it('parses checked sync requests from managed comments', () => {
    const parsed = parseManagedPreviewComment(`
<!-- cf-pages-preview-mirror original-pr=123 target-sha=${APPROVED_SOURCE_SHA} mirrored-sha=${SOURCE_SHA} -->
- [x] Sync Cloudflare preview to approval target commit
`)

    assert.deepEqual(parsed, {
      mirroredSha: SOURCE_SHA,
      originalPrNumber: 123,
      shouldSync: true,
      targetSha: APPROVED_SOURCE_SHA,
    })
  })

  it('ignores unchecked managed comments', () => {
    const parsed = parseManagedPreviewComment(`
<!-- cf-pages-preview-mirror original-pr=123 target-sha=${SOURCE_SHA} mirrored-sha=${SOURCE_SHA} -->
- [ ] Sync Cloudflare preview to approval target commit
`)

    assert.deepEqual(parsed, {
      mirroredSha: SOURCE_SHA,
      originalPrNumber: 123,
      shouldSync: false,
      targetSha: SOURCE_SHA,
    })
  })

  it('ignores legacy sync checkbox text', () => {
    const parsed = parseManagedPreviewComment(`
<!-- cf-pages-preview-mirror original-pr=123 target-sha=${APPROVED_SOURCE_SHA} mirrored-sha=${SOURCE_SHA} -->
- [x] Sync Cloudflare preview to latest fork commit
`)

    assert.deepEqual(parsed, {
      mirroredSha: SOURCE_SHA,
      originalPrNumber: 123,
      shouldSync: false,
      targetSha: APPROVED_SOURCE_SHA,
    })
  })
})
