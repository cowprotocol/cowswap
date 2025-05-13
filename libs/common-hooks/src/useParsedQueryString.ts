import { useMemo } from 'react'

import { parse, ParsedQs } from 'qs'
import { useLocation } from 'react-router'

export function parsedQueryString(search?: string): ParsedQs {
  if (!search) {
    // react-router-dom places search string in the hash
    const hash = window.location.hash
    search = hash.substr(hash.indexOf('?'))
  }
  return search && search.length > 1 ? parse(search, { parseArrays: false, ignoreQueryPrefix: true }) : {}
}

export function useParsedQueryString(): ParsedQs {
  const { search } = useLocation()
  return useMemo(() => parsedQueryString(search), [search])
}
