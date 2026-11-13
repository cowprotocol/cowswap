/**
 * Matches a GitHub raw URL and captures everything except the git ref:
 * `https://raw.githubusercontent.com/<owner>/<repo>/<ref>/<path>`.
 *
 * Only refs that can be identified with certainty are stripped: a 40-character commit SHA, or the
 * default branch in its short (`main/…`) or long (`refs/heads/main/…`) form. A ref may itself contain
 * slashes, and nothing in the URL marks where it ends and the path begins — `refs/heads/release/v1/l.json`
 * is `release/v1` + `l.json` or `release` + `v1/l.json`, indistinguishable. Guessing there does not just
 * miss a match: it builds a key that can belong to a different file in the same repo, and
 * `dropRepinnedDuplicates` would then delete a list that is not a duplicate. Anything unrecognized is
 * left verbatim, which costs a missed match and nothing else.
 */
const GITHUB_RAW_REF =
  /^(https:\/\/raw\.githubusercontent\.com\/[^/]+\/[^/]+\/)(?:refs\/heads\/)?(?:[0-9a-f]{40}|main|master)\/(.+)$/

/**
 * Identity of a token list.
 *
 * GitHub-hosted lists are pinned to a commit and get re-pinned when their owner updates them, so the
 * URL is not a stable identity: lists already persisted in a user's storage keep the old one. The git
 * ref is therefore dropped — owner, repo and path identify the list across re-pins.
 */
export function getSourceAsKey(source: string): string {
  return source.toLowerCase().trim().replace(GITHUB_RAW_REF, '$1$2')
}
