/** Must match `DESCRIPTION_MAX_LENGTH` in `scripts/profiles/description.mjs` */
export const RWA_DESCRIPTION_MAX_LENGTH = 2000

const MARKUP_REGEX = /[<>{}`]/
const INVISIBLE_CHAR_REGEX = /[\p{Cc}\p{Cf}]/u
const URL_SCHEME_REGEX = /:\/\//
const DOMAIN_REGEX = /\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}\b/gi

/**
 * Why a profile description cannot be shown, `null` if it can. Same rule as `findDescriptionIssue` in
 * `scripts/profiles/description.mjs`. Domains are allowed only when they are part of the asset title, like "Trip.com"
 * in "Trip.com Group".
 */
export function findRwaDescriptionIssue(description: string, title: string): string | null {
  if (description.length > RWA_DESCRIPTION_MAX_LENGTH) return `must be at most ${RWA_DESCRIPTION_MAX_LENGTH} characters`
  if (MARKUP_REGEX.test(description)) return 'must not contain <, >, {, } or `'
  if (INVISIBLE_CHAR_REGEX.test(description)) return 'must not contain control or invisible characters'

  const lowerTitle = title.toLowerCase()
  const hasForeignDomain = (description.match(DOMAIN_REGEX) ?? []).some(
    (domain) => !lowerTitle.includes(domain.toLowerCase()),
  )
  if (URL_SCHEME_REGEX.test(description) || hasForeignDomain) return 'must not contain links or domains'

  return null
}
