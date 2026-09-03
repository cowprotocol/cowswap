import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { restrictedListsAtom } from '../../state/restrictedTokens/restrictedTokensAtom'

export interface ListBlockedResult {
  isBlocked: boolean
  isLoading: boolean
}

export function getCountryAsKey(country: string): string {
  return country.toUpperCase()
}

/**
 * Matches a GitHub raw URL and captures everything except the git ref:
 * `https://raw.githubusercontent.com/<owner>/<repo>/<ref>/<path>`, where `<ref>` is a branch, a tag,
 * a commit SHA, or the `refs/heads/<branch>` / `refs/tags/<tag>` long form.
 */
const GITHUB_RAW_REF = /^(https:\/\/raw\.githubusercontent\.com\/[^/]+\/[^/]+\/)(?:refs\/(?:heads|tags)\/)?[^/]+\/(.+)$/

/**
 * Identity of a token list, for looking up its restricted countries and consent hash.
 *
 * Restricted lists are pinned to a commit and get re-pinned whenever the issuer adds a token, so the
 * URL is not a stable identity: the CMS would move to the new URL while lists already persisted in a
 * user's storage keep the old one, and geoblocking would silently stop matching them. The git ref is
 * therefore dropped — owner, repo and path identify the list across re-pins.
 */
export function getSourceAsKey(source: string): string {
  return source.toLowerCase().trim().replace(GITHUB_RAW_REF, '$1$2')
}

/**
 * check if a token list is blocked for the given country
 */
export function useIsListBlocked(listSource: string | undefined, country: string | null): ListBlockedResult {
  const restrictedLists = useAtomValue(restrictedListsAtom)

  return useMemo(() => {
    if (!listSource || !restrictedLists.isLoaded) {
      return { isBlocked: false, isLoading: !restrictedLists.isLoaded }
    }

    if (!country) {
      return { isBlocked: false, isLoading: false }
    }

    const blockedCountries = restrictedLists.blockedCountriesPerList[getSourceAsKey(listSource)]

    if (!blockedCountries) {
      return { isBlocked: false, isLoading: false }
    }

    const isBlocked = blockedCountries.includes(getCountryAsKey(country))
    return { isBlocked, isLoading: false }
  }, [listSource, country, restrictedLists])
}
