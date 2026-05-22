// Only feat and fix produce changesets. Other types (chore, docs, refactor, etc.)
// are intentionally skipped — they don't represent consumer-visible behavior
// changes, so they don't earn a release. Breaking changes override this and
// always produce a major bump regardless of type (see parseConventionalCommit).
const TYPE_BUMP = {
  feat: 'minor',
  fix: 'patch',
}

const CONVENTIONAL_RE = /^(?<type>[a-zA-Z]+)(?:\((?<scope>[^)]+)\))?(?<bang>!)?:\s+(?<rest>.+)$/

// Returns { parsedOk, bump, type, scope, breaking }. `bump` is one of
// 'major' | 'minor' | 'patch' | null. A `null` bump means "skip this commit"
// (non-conventional, or a type not in TYPE_BUMP that isn't breaking).
export function parseConventionalCommit(subject, body = '') {
  const match = CONVENTIONAL_RE.exec(subject || '')
  if (!match) {
    return { parsedOk: false, bump: null, type: null, scope: null, breaking: false }
  }
  const { type, scope, bang } = match.groups
  const hasBreakingFooter = /^BREAKING[ -]CHANGE:/m.test(body || '')
  const breaking = Boolean(bang) || hasBreakingFooter
  let bump
  if (breaking) {
    bump = 'major'
  } else {
    bump = TYPE_BUMP[type.toLowerCase()] ?? null
  }
  return { parsedOk: true, bump, type, scope: scope || null, breaking }
}

export function resolvePackageForFile(filePath, packagePaths) {
  let best = null
  for (const pkgPath of packagePaths) {
    if (filePath === pkgPath || filePath.startsWith(pkgPath + '/')) {
      if (!best || pkgPath.length > best.length) {
        best = pkgPath
      }
    }
  }
  return best
}

export function resolveAffectedPackages(filePaths, packagePaths) {
  const set = new Set()
  for (const f of filePaths) {
    const p = resolvePackageForFile(f, packagePaths)
    if (p) set.add(p)
  }
  return set
}

export function changesetFilename(sha, pkgPath) {
  const slug = pkgPath.replace(/\//g, '-')
  return `auto-${sha.slice(0, 7)}-${slug}.md`
}

export function changesetContent(packageName, bump, summary) {
  return `---
"${packageName}": ${bump}
---

${summary}
`
}

// Subject of a release-PR merge commit on main. The release workflow configures
// changesets/action with `title: "chore(main): release"`, so GitHub's squash
// merge produces `chore(main): release (#N)`. The `(#N)` suffix is optional to
// also cover the rare direct-push case (no PR).
export const RELEASE_COMMIT_SUBJECT_RE = /^chore\(main\): release( \(#\d+\))?$/

export function isReleaseCommitSubject(subject) {
  return RELEASE_COMMIT_SUBJECT_RE.test((subject || '').trim())
}

// Pure resolver for the converter's baseline ref. Precedence:
//   1. envBaseline   — workflow_dispatch override.
//   2. releasePrCommit — a `chore(main): release` commit on main that's
//      newer than the latest `release-*` tag. Required because the
//      `release-*` tag is only pushed at the END of the publish job, but
//      the converter runs at the START of the same workflow — so on the
//      run that processes a release-PR merge, the tag still points at the
//      *previous* baseline. Without this hop the converter re-emits the
//      changesets the just-merged release PR consumed, spawning a phantom
//      duplicate version PR.
//   3. latestReleaseTag — steady-state path.
//   4. null → caller logs a bootstrap warning.
export function resolveBaselineRef({ envBaseline, latestReleaseTag, releasePrCommit }) {
  const env = (envBaseline || '').trim()
  if (env) return { ref: env, source: 'env' }
  if (releasePrCommit) return { ref: releasePrCommit, source: 'release-pr-merge' }
  if (latestReleaseTag) return { ref: latestReleaseTag, source: 'release-tag' }
  return { ref: null, source: 'none' }
}

// Most recent `chore(main): release` commit reachable from HEAD on main's
// first-parent line, since `sinceRef`. Returns null if none. See
// `resolveBaselineRef` in the lib for why we look for this.
//
// `runGit` is injectable so the function is unit-testable without spawning
// `git`; the default invokes the module-private `tryGit`.

export function findRecentReleasePrCommit(sinceRef, runGit = tryGit) {
  const raw = runGit(['log', `${sinceRef}..HEAD`, '--first-parent', '--format=%H%x09%s'])
  if (!raw) return null
  for (const line of raw.split('\n')) {
    const tab = line.indexOf('\t')
    if (tab < 0) continue
    const sha = line.slice(0, tab).trim()
    const subject = line.slice(tab + 1)
    if (sha && isReleaseCommitSubject(subject)) return sha
  }
  return null
}
