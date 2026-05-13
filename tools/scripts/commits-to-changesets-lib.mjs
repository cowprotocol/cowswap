const TYPE_BUMP = {
  feat: 'minor',
  fix: 'patch',
  perf: 'patch',
  refactor: 'patch',
  docs: 'patch',
  test: 'patch',
  chore: 'patch',
  build: 'patch',
  ci: 'patch',
  style: 'patch',
  revert: 'patch',
}

const CONVENTIONAL_RE =
  /^(?<type>[a-zA-Z]+)(?:\((?<scope>[^)]+)\))?(?<bang>!)?:\s+(?<rest>.+)$/

export function parseConventionalCommit(subject, body = '') {
  const match = CONVENTIONAL_RE.exec(subject || '')
  if (!match) {
    return { parsedOk: false, bump: 'patch', type: null, scope: null, breaking: false }
  }
  const { type, scope, bang } = match.groups
  const hasBreakingFooter = /^BREAKING[ -]CHANGE:/m.test(body || '')
  const breaking = Boolean(bang) || hasBreakingFooter
  let bump = TYPE_BUMP[type.toLowerCase()] ?? 'patch'
  if (breaking) bump = 'major'
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
