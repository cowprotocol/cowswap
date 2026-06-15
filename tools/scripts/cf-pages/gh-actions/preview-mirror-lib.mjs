import { isNotFoundError } from './github-client.mjs'
import {
  buildPreviewCommentBody,
  formatShortSha,
  MANAGED_COMMENT_MARKER,
  parseManagedPreviewComment,
} from './preview-mirror-comment.mjs'

const DEFAULT_BRANCH_PREFIX = 'cf-preview/pr-'
const DEFAULT_TRIGGER_LABEL = 'trigger-preview'
const MIRROR_PULL_REQUEST_LABELS = ['DONT_MERGE']
const TRUSTED_PERMISSIONS = new Set(['admin', 'maintain', 'write'])

export function buildPreviewBranch(originalPrNumber, branchPrefix = DEFAULT_BRANCH_PREFIX) {
  return `${branchPrefix}${originalPrNumber}`
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

  if (event.action === 'synchronize' && event.pull_request) {
    return handleSynchronizedPullRequest({
      actor,
      client,
      event,
      now,
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

  let result

  if (isForkPullRequest(pullRequest)) {
    result = await syncPreviewBranch({
      approvedSha: pullRequest.head.sha,
      actor,
      client,
      commentId: null,
      now,
      options,
      pullRequest,
    })
  } else {
    result = {
      reason: 'pull request is not from a fork',
      status: 'ignored',
    }
  }
  await client.removeIssueLabel(pullRequest.number, options.triggerLabel)

  return result
}

async function handleSynchronizedPullRequest({ actor, client, event, now, options }) {
  const pullRequest = event.pull_request

  if (!isForkPullRequest(pullRequest)) {
    return {
      reason: 'pull request is not from a fork',
      status: 'ignored',
    }
  }

  const branchName = buildPreviewBranch(pullRequest.number, options.branchPrefix)
  const existingComment = await findPreviewComment(client, pullRequest.number)

  if (!existingComment) {
    return {
      reason: 'managed preview comment not found',
      status: 'ignored',
    }
  }

  const existingPreviewComment = parseManagedPreviewComment(existingComment.body)
  const mirrorPullRequest = await client.getPullRequestByHead(branchName)

  if (!mirrorPullRequest) {
    return {
      reason: 'mirror pull request not found',
      status: 'ignored',
    }
  }

  const body = buildPreviewCommentBody({
    actor,
    approvalTargetSha: pullRequest.head.sha,
    branchName,
    mirroredSha: existingPreviewComment?.mirroredSha ?? existingPreviewComment?.targetSha ?? null,
    mirrorPullRequestNumber: mirrorPullRequest.number,
    mirrorPullRequestUrl: mirrorPullRequest.html_url,
    now,
    originalPrNumber: pullRequest.number,
    repoFullName: options.repoFullName,
    sourceBranch: pullRequest.head.ref,
    sourceRepoFullName: pullRequest.head.repo.full_name,
    sourceSha: pullRequest.head.sha,
  })

  await client.updateIssueComment(existingComment.id, body)

  return {
    branchName,
    status: 'approval-target-updated',
  }
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
  const syncRequest = parseManagedPreviewComment(event.comment.body)

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

  if (!syncRequest.targetSha) {
    return {
      reason: 'managed sync comment is missing approval target sha',
      status: 'ignored',
    }
  }

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
    approvedSha: syncRequest.targetSha,
    actor,
    client,
    commentId: event.comment.id,
    now,
    options,
    pullRequest,
  })
}

async function syncPreviewBranch({ actor, approvedSha, client, commentId, now, options, pullRequest }) {
  const branchName = buildPreviewBranch(pullRequest.number, options.branchPrefix)
  await upsertPreviewBranch(client, branchName, approvedSha)
  const mirrorPullRequest = await upsertMirrorPullRequest(client, pullRequest, branchName, approvedSha)

  const body = buildPreviewCommentBody({
    actor,
    approvalTargetSha: pullRequest.head.sha,
    branchName,
    mirroredSha: approvedSha,
    mirrorPullRequestNumber: mirrorPullRequest.number,
    mirrorPullRequestUrl: mirrorPullRequest.html_url,
    now,
    originalPrNumber: pullRequest.number,
    repoFullName: options.repoFullName,
    sourceBranch: pullRequest.head.ref,
    sourceRepoFullName: pullRequest.head.repo.full_name,
    sourceSha: approvedSha,
  })

  await savePreviewComment(client, {
    body,
    commentId,
    issueNumber: pullRequest.number,
  })

  return {
    branchName,
    mirrorPullRequestNumber: mirrorPullRequest.number,
    status: 'synced',
  }
}

async function upsertPreviewBranch(client, branchName, sha) {
  try {
    // Checks whether the branch exists, and throws if it doesnt. Ignore result as we only care about the existence, not contents
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

async function upsertMirrorPullRequest(client, sourcePullRequest, branchName, sourceSha) {
  const body = buildMirrorPullRequestBody(sourcePullRequest, sourceSha)
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
      draft: true, // We don't intend them to be merged, create as draft
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

function buildMirrorPullRequestBody(sourcePullRequest, sourceSha = sourcePullRequest.head.sha) {
  return [
    `<!-- ${MANAGED_COMMENT_MARKER} original-pr=${sourcePullRequest.number} -->`,
    `This PR mirrors fork PR #${sourcePullRequest.number} for Cloudflare Pages preview builds.`,
    '',
    `Source PR: ${sourcePullRequest.html_url}`,
    `Source fork branch: \`${sourcePullRequest.head.repo.full_name}:${sourcePullRequest.head.ref}\``,
    `Mirrored SHA: \`${formatShortSha(sourceSha)}\``,
    '',
    'Do not merge this PR. Close the source PR to clean up this mirror.',
  ].join('\n')
}

async function savePreviewComment(client, { body, commentId, issueNumber }) {
  const _commentId = commentId || (await findPreviewComment(client, issueNumber))?.id

  if (_commentId) {
    await client.updateIssueComment(_commentId, body)
  } else {
    await client.createIssueComment(issueNumber, body)
  }
}

async function findPreviewComment(client, issueNumber) {
  return client.findIssueComment(issueNumber, (comment) => {
    return (
      typeof comment.body === 'string' && parseManagedPreviewComment(comment.body)?.originalPrNumber === issueNumber
    )
  })
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
