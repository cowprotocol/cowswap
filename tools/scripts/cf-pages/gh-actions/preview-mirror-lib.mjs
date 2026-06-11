const DEFAULT_BRANCH_PREFIX = 'cf-preview/pr-'
const DEFAULT_TRIGGER_LABEL = 'trigger-preview'
const GITHUB_API_BASE = 'https://api.github.com'
const MANAGED_COMMENT_MARKER = 'cf-pages-preview-mirror'
const MIRROR_PULL_REQUEST_LABELS = ['DONT_MERGE']
const SYNC_CHECKBOX_TEXT = 'Sync Cloudflare preview to latest fork commit'
const TRUSTED_PERMISSIONS = new Set(['admin', 'maintain', 'write'])

export class GitHubApiError extends Error {
  constructor(status, message) {
    super(message)
    this.name = 'GitHubApiError'
    this.status = status
  }
}

export function buildPreviewBranch(originalPrNumber, branchPrefix = DEFAULT_BRANCH_PREFIX) {
  return `${branchPrefix}${originalPrNumber}`
}

export function buildPreviewCommentBody({
  actor,
  branchName,
  mirrorPullRequestNumber,
  mirrorPullRequestUrl,
  now,
  originalPrNumber,
  repoFullName,
  sourceBranch,
  sourceRepoFullName,
  sourceSha,
}) {
  const shortSha = sourceSha.slice(0, 12)

  return `<!-- ${MANAGED_COMMENT_MARKER} original-pr=${originalPrNumber} -->
Cloudflare Pages preview mirror

Preview branch: \`${branchName}\`
Preview branch URL: https://github.com/${repoFullName}/tree/${branchName}
Mirror PR: #${mirrorPullRequestNumber}
Mirror PR URL: ${mirrorPullRequestUrl}
Cloudflare Pages preview links will be posted on the mirror PR by the Cloudflare Pages GitHub integration once builds complete.

Source fork branch: \`${sourceRepoFullName}:${sourceBranch}\`
Mirrored SHA: \`${shortSha}\`
Last synced by: @${actor} at ${now.toISOString()}

- [ ] ${SYNC_CHECKBOX_TEXT}
`
}

export function parseSyncRequest(commentBody) {
  const markerMatch = commentBody.match(new RegExp(`<!--\\s*${MANAGED_COMMENT_MARKER}\\s+original-pr=(\\d+)\\s*-->`))

  if (!markerMatch) {
    return null
  }

  const checkboxPattern = new RegExp(`- \\[[xX ]\\] ${escapeRegExp(SYNC_CHECKBOX_TEXT)}`)
  const checkboxMatch = commentBody.match(checkboxPattern)

  if (!checkboxMatch) {
    return {
      originalPrNumber: Number(markerMatch[1]),
      shouldSync: false,
    }
  }

  return {
    originalPrNumber: Number(markerMatch[1]),
    shouldSync: checkboxMatch[0].startsWith('- [x]') || checkboxMatch[0].startsWith('- [X]'),
  }
}

export function createGitHubClient({
  apiBase = process.env.GITHUB_API_URL ?? GITHUB_API_BASE,
  repoFullName,
  token,
}) {
  const [owner, repo] = repoFullName.split('/')

  if (!owner || !repo) {
    throw new Error(`Expected GITHUB_REPOSITORY to be in owner/repo format, received: ${repoFullName}`)
  }

  async function request(method, path, body) {
    const response = await fetch(`${apiBase}${path}`, {
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      method,
    })
    const responseBody = await response.text()
    const data = parseGitHubResponse(responseBody)

    if (!response.ok) {
      const message = getGitHubErrorMessage(data, response.status)
      throw new GitHubApiError(response.status, message)
    }

    return data
  }

  return {
    async addIssueLabels(issueNumber, labels) {
      return request('POST', `/repos/${owner}/${repo}/issues/${issueNumber}/labels`, { labels })
    },
    async createIssueComment(issueNumber, body) {
      return request('POST', `/repos/${owner}/${repo}/issues/${issueNumber}/comments`, { body })
    },
    async createPullRequest(payload) {
      return request('POST', `/repos/${owner}/${repo}/pulls`, payload)
    },
    async createRef(branchName, sha) {
      return request('POST', `/repos/${owner}/${repo}/git/refs`, {
        ref: `refs/heads/${branchName}`,
        sha,
      })
    },
    async closePullRequest(prNumber) {
      return request('PATCH', `/repos/${owner}/${repo}/pulls/${prNumber}`, { state: 'closed' })
    },
    async deleteRef(branchName) {
      return request('DELETE', `/repos/${owner}/${repo}/git/refs/${encodeGitRefPath(`heads/${branchName}`)}`)
    },
    async getCollaboratorPermission(username) {
      const data = await request(
        'GET',
        `/repos/${owner}/${repo}/collaborators/${encodeURIComponent(username)}/permission`,
      )
      return typeof data.permission === 'string' ? data.permission : 'none'
    },
    async getPullRequest(prNumber) {
      return request('GET', `/repos/${owner}/${repo}/pulls/${prNumber}`)
    },
    async getPullRequestByHead(branchName) {
      const pulls = await request(
        'GET',
        `/repos/${owner}/${repo}/pulls?state=all&head=${encodeURIComponent(`${owner}:${branchName}`)}&per_page=10`,
      )

      if (!Array.isArray(pulls)) {
        return null
      }

      return pulls.find((pullRequest) => pullRequest.state === 'open') ?? pulls[0] ?? null
    },
    async getRef(branchName) {
      return request('GET', `/repos/${owner}/${repo}/git/ref/${encodeGitRefPath(`heads/${branchName}`)}`)
    },
    async listIssueComments(issueNumber) {
      return request('GET', `/repos/${owner}/${repo}/issues/${issueNumber}/comments?per_page=100`)
    },
    async removeIssueLabel(issueNumber, labelName) {
      try {
        return await request(
          'DELETE',
          `/repos/${owner}/${repo}/issues/${issueNumber}/labels/${encodeURIComponent(labelName)}`,
        )
      } catch (error) {
        if (isNotFoundError(error)) {
          return null
        }
        throw error
      }
    },
    async updateIssueComment(commentId, body) {
      return request('PATCH', `/repos/${owner}/${repo}/issues/comments/${commentId}`, { body })
    },
    async updatePullRequest(prNumber, payload) {
      return request('PATCH', `/repos/${owner}/${repo}/pulls/${prNumber}`, payload)
    },
    async updateRef(branchName, sha) {
      return request('PATCH', `/repos/${owner}/${repo}/git/refs/${encodeGitRefPath(`heads/${branchName}`)}`, {
        force: true,
        sha,
      })
    },
  }
}

export async function handlePreviewMirrorEvent({ actor, client, event, now = new Date(), options }) {
  const normalizedOptions = normalizeOptions(options)

  if (event.action === 'labeled' && event.pull_request) {
    return handleLabeledPullRequest({
      actor,
      client,
      event,
      now,
      options: normalizedOptions,
    })
  }

  if (event.action === 'closed' && event.pull_request) {
    return handleClosedPullRequest({
      client,
      event,
      options: normalizedOptions,
    })
  }

  if (event.action === 'edited' && event.comment && event.issue?.pull_request) {
    return handleEditedIssueComment({
      actor,
      client,
      event,
      now,
      options: normalizedOptions,
    })
  }

  return {
    reason: 'unsupported event',
    status: 'ignored',
  }
}

async function handleLabeledPullRequest({ actor, client, event, now, options }) {
  if (event.label?.name !== options.triggerLabel) {
    return {
      reason: 'label does not match trigger label',
      status: 'ignored',
    }
  }

  const pullRequest = event.pull_request

  await assertTrustedActor(client, actor)

  if (!isForkPullRequest(pullRequest)) {
    await client.removeIssueLabel(pullRequest.number, options.triggerLabel)

    return {
      reason: 'pull request is not from a fork',
      status: 'ignored',
    }
  }

  const result = await syncPreviewBranch({
    actor,
    client,
    commentId: null,
    now,
    options,
    pullRequest,
  })

  await client.removeIssueLabel(pullRequest.number, options.triggerLabel)

  return result
}

async function handleClosedPullRequest({ client, event, options }) {
  const pullRequest = event.pull_request
  const branchName = buildPreviewBranch(pullRequest.number, options.branchPrefix)
  await closeMirrorPullRequest(client, branchName)
  await deletePreviewBranch(client, branchName)

  return {
    branchName,
    status: 'deleted',
  }
}

async function handleEditedIssueComment({ actor, client, event, now, options }) {
  const syncRequest = parseSyncRequest(event.comment.body)

  if (!syncRequest?.shouldSync) {
    return {
      reason: 'managed sync checkbox is not checked',
      status: 'ignored',
    }
  }

  if (event.issue.number !== syncRequest.originalPrNumber) {
    return {
      reason: 'managed comment issue does not match original pull request',
      status: 'ignored',
    }
  }

  await assertTrustedActor(client, actor)

  const pullRequest = await client.getPullRequest(syncRequest.originalPrNumber)

  if (pullRequest.state !== 'open') {
    return {
      reason: 'source pull request is not open',
      status: 'ignored',
    }
  }

  if (!isForkPullRequest(pullRequest)) {
    return {
      reason: 'pull request is not from a fork',
      status: 'ignored',
    }
  }

  return syncPreviewBranch({
    actor,
    client,
    commentId: event.comment.id,
    now,
    options,
    pullRequest,
  })
}

async function syncPreviewBranch({ actor, client, commentId, now, options, pullRequest }) {
  const branchName = buildPreviewBranch(pullRequest.number, options.branchPrefix)
  await upsertPreviewBranch(client, branchName, pullRequest.head.sha)
  const mirrorPullRequest = await upsertMirrorPullRequest(client, pullRequest, branchName)

  const body = buildPreviewCommentBody({
    actor,
    branchName,
    mirrorPullRequestNumber: mirrorPullRequest.number,
    mirrorPullRequestUrl: mirrorPullRequest.html_url,
    now,
    originalPrNumber: pullRequest.number,
    repoFullName: options.repoFullName,
    sourceBranch: pullRequest.head.ref,
    sourceRepoFullName: pullRequest.head.repo.full_name,
    sourceSha: pullRequest.head.sha,
  })

  if (commentId) {
    await client.updateIssueComment(commentId, body)
  } else {
    await upsertPreviewComment(client, pullRequest.number, body)
  }

  return {
    branchName,
    mirrorPullRequestNumber: mirrorPullRequest.number,
    status: 'synced',
  }
}

async function upsertPreviewBranch(client, branchName, sha) {
  try {
    await client.getRef(branchName)
    await client.updateRef(branchName, sha)
  } catch (error) {
    if (isNotFoundError(error)) {
      await client.createRef(branchName, sha)
      return
    }

    throw error
  }
}

async function deletePreviewBranch(client, branchName) {
  try {
    await client.deleteRef(branchName)
  } catch (error) {
    if (!isNotFoundError(error)) {
      throw error
    }
  }
}

async function upsertMirrorPullRequest(client, sourcePullRequest, branchName) {
  const body = buildMirrorPullRequestBody(sourcePullRequest)
  const existingPullRequest = await client.getPullRequestByHead(branchName)
  let mirrorPullRequest

  if (existingPullRequest?.state === 'open') {
    mirrorPullRequest = await client.updatePullRequest(existingPullRequest.number, {
      body,
      title: buildMirrorPullRequestTitle(sourcePullRequest.number),
    })
  } else {
    mirrorPullRequest = await client.createPullRequest({
      base: sourcePullRequest.base.ref,
      body,
      draft: true,
      head: branchName,
      title: buildMirrorPullRequestTitle(sourcePullRequest.number),
    })
    await client.addIssueLabels(mirrorPullRequest.number, MIRROR_PULL_REQUEST_LABELS)
  }

  return mirrorPullRequest
}

async function closeMirrorPullRequest(client, branchName) {
  const mirrorPullRequest = await client.getPullRequestByHead(branchName)

  if (mirrorPullRequest?.state === 'open') {
    await client.closePullRequest(mirrorPullRequest.number)
  }
}

function buildMirrorPullRequestTitle(originalPrNumber) {
  return `preview: mirror fork PR #${originalPrNumber}`
}

function buildMirrorPullRequestBody(sourcePullRequest) {
  return [
    `<!-- ${MANAGED_COMMENT_MARKER} original-pr=${sourcePullRequest.number} -->`,
    `This PR mirrors fork PR #${sourcePullRequest.number} for Cloudflare Pages preview builds.`,
    '',
    `Source PR: ${sourcePullRequest.html_url}`,
    `Source fork branch: \`${sourcePullRequest.head.repo.full_name}:${sourcePullRequest.head.ref}\``,
    `Mirrored SHA: \`${sourcePullRequest.head.sha.slice(0, 12)}\``,
    '',
    'Do not merge this PR. Close the source PR to clean up this mirror.',
  ].join('\n')
}

async function upsertPreviewComment(client, issueNumber, body) {
  const comments = await client.listIssueComments(issueNumber)
  const existingComment = comments.find((comment) => {
    return typeof comment.body === 'string' && parseSyncRequest(comment.body)?.originalPrNumber === issueNumber
  })

  if (existingComment) {
    await client.updateIssueComment(existingComment.id, body)
    return
  }

  await client.createIssueComment(issueNumber, body)
}

async function assertTrustedActor(client, actor) {
  const permission = await client.getCollaboratorPermission(actor)

  if (!TRUSTED_PERMISSIONS.has(permission)) {
    throw new Error(`@${actor} must have write, maintain, or admin permission to trigger preview mirroring.`)
  }
}

function normalizeOptions(options) {
  return {
    branchPrefix: options.branchPrefix ?? DEFAULT_BRANCH_PREFIX,
    repoFullName: options.repoFullName,
    triggerLabel: options.triggerLabel ?? DEFAULT_TRIGGER_LABEL,
  }
}

function isForkPullRequest(pullRequest) {
  const headRepoName = pullRequest.head?.repo?.full_name
  const baseRepoName = pullRequest.base?.repo?.full_name

  return Boolean(headRepoName && baseRepoName && headRepoName !== baseRepoName)
}

function encodeGitRefPath(refPath) {
  return refPath.split('/').map(encodeURIComponent).join('/')
}

function parseGitHubResponse(responseBody) {
  if (!responseBody) {
    return {}
  }

  try {
    return JSON.parse(responseBody)
  } catch {
    return {
      message: responseBody,
    }
  }
}

function getGitHubErrorMessage(data, status) {
  if (typeof data.message === 'string') {
    return data.message
  }

  return `GitHub API request failed with status ${status}`
}

function isNotFoundError(error) {
  return error?.status === 404
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
