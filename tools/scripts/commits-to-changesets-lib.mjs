// Only feat and fix produce changesets. Other types (chore, docs, refactor, etc.)
// are intentionally skipped — they don't represent consumer-visible behavior
// changes, so they don't earn a release. Breaking changes override this and
// always produce a major bump regardless of type (see parseConventionalCommit).
const TYPE_BUMP = {
  feat: 'minor',
  fix: 'patch',
}

const CONVENTIONAL_RE =
  /^(?<type>[a-zA-Z]+)(?:\((?<scope>[^)]+)\))?(?<bang>!)?:\s+(?<rest>.+)$/

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
