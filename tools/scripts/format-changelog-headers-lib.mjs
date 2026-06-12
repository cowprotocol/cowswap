// Pure helpers for rewriting changesets-generated CHANGELOG.md version headers
// into the release-please-style `## [X.Y.Z](compare-link) (DATE)` form.
//
// Tested separately via format-changelog-headers.test.mjs. The I/O wrapper
// (iterating tracked packages, reading repo config, writing files) lives in
// format-changelog-headers.mjs.

const VERSION_HEADER = /^## (?:\[(\d+\.\d+\.\d+(?:-[\w.]+)?)\]|(\d+\.\d+\.\d+(?:-[\w.]+)?))[^\n]*$/gm

export function shortNameFromPkgName(name) {
  return name.includes('/') ? name.split('/').pop() : name
}

export function formatChangelogHeader({ shortName, version, prevVersion, date, repo }) {
  const url = prevVersion
    ? `https://github.com/${repo}/compare/${shortName}-v${prevVersion}...${shortName}-v${version}`
    : `https://github.com/${repo}/releases/tag/${shortName}-v${version}`
  return `## [${version}](${url}) (${date})`
}

export function rewriteChangelog({ changelog, pkgVersion, shortName, date, repo }) {
  VERSION_HEADER.lastIndex = 0
  const first = VERSION_HEADER.exec(changelog)
  if (!first) return changelog

  const bracketedVersion = first[1]
  const plainVersion = first[2]

  // Top header is already in target format — nothing to do.
  if (bracketedVersion) return changelog

  // Top plain header doesn't match the current package version — means this
  // CHANGELOG.md wasn't bumped on this run. Leave it alone.
  if (plainVersion !== pkgVersion) return changelog

  const second = VERSION_HEADER.exec(changelog)
  const prevVersion = second ? second[1] || second[2] : null

  const newHeader = formatChangelogHeader({
    shortName,
    version: plainVersion,
    prevVersion,
    date,
    repo,
  })

  return changelog.slice(0, first.index) + newHeader + changelog.slice(first.index + first[0].length)
}
