export const MANAGED_COMMENT_MARKER = 'cf-pages-preview-mirror'

const GIT_SHA_PATTERN = /^[0-9a-f]{40}$/i
const SYNC_CHECKBOX_TEXT = 'Sync Cloudflare preview to approval target commit'

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
  approvalTargetSha = sourceSha,
  mirroredSha = sourceSha,
}) {
  const markerAttributes = [`original-pr=${originalPrNumber}`, `target-sha=${approvalTargetSha}`]
  if (mirroredSha) {
    markerAttributes.push(`mirrored-sha=${mirroredSha}`)
  }
  const approvalTargetShortSha = formatShortSha(approvalTargetSha)
  const mirroredShaLine = mirroredSha
    ? `Last mirrored SHA: \`${formatShortSha(mirroredSha)}\``
    : 'Last mirrored SHA: not available'

  return `<!-- ${MANAGED_COMMENT_MARKER} ${markerAttributes.join(' ')} -->
Cloudflare Pages preview mirror

Preview branch: \`${branchName}\`
Preview branch URL: https://github.com/${repoFullName}/tree/${branchName}
Mirror PR: #${mirrorPullRequestNumber}
Mirror PR URL: ${mirrorPullRequestUrl}
Cloudflare Pages preview links will be posted on the mirror PR by the Cloudflare Pages GitHub integration once builds complete.

Source fork branch: \`${sourceRepoFullName}:${sourceBranch}\`
Approval target SHA: \`${approvalTargetShortSha}\`
${mirroredShaLine}
Last comment update: @${actor} at ${now.toISOString()}

- [ ] ${SYNC_CHECKBOX_TEXT}
`
}

export function parseManagedPreviewComment(commentBody) {
  const metadata = parseManagedCommentMetadata(commentBody)

  if (!metadata) {
    return null
  }

  const checkbox = parseSyncCheckbox(commentBody)

  if (!checkbox) {
    return {
      ...metadata,
      shouldSync: false,
    }
  }

  return {
    ...metadata,
    shouldSync: checkbox.checked,
  }
}

export function formatShortSha(sha) {
  return sha.slice(0, 12)
}

function parseManagedCommentMetadata(commentBody) {
  const markerMatch = commentBody.match(new RegExp(`<!--\\s*${MANAGED_COMMENT_MARKER}([^>]*)-->`))

  if (!markerMatch) {
    return null
  }

  const attributes = new Map()
  for (const attributeMatch of markerMatch[1].matchAll(/([a-z-]+)=([^\s>]+)/g)) {
    attributes.set(attributeMatch[1], attributeMatch[2])
  }

  const originalPrNumber = Number(attributes.get('original-pr'))
  if (!Number.isInteger(originalPrNumber) || originalPrNumber <= 0) {
    return null
  }

  return {
    mirroredSha: normalizeGitSha(attributes.get('mirrored-sha')),
    originalPrNumber,
    targetSha: normalizeGitSha(attributes.get('target-sha')),
  }
}

function parseSyncCheckbox(commentBody) {
  const checkboxMatch = commentBody.match(new RegExp(`- \\[([xX ])\\] ${escapeRegExp(SYNC_CHECKBOX_TEXT)}`))

  if (!checkboxMatch) {
    return null
  }

  return {
    checked: checkboxMatch[1].toLowerCase() === 'x',
  }
}

function normalizeGitSha(value) {
  if (typeof value !== 'string' || !GIT_SHA_PATTERN.test(value)) {
    return null
  }

  return value.toLowerCase()
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
