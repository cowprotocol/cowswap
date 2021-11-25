import { useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import qs from 'qs'

import useParsedQueryString from 'hooks/useParsedQueryString'

/**
 * When query parameter is empty will be filtered
 *  example: ?referral=&paramFullfilled=123
 *  result: {paramFullfilled: 123}
 *
 * @param queryParams The object to check
 */
function filterEmptyQueryValues(queryParams: { [s: string]: unknown }) {
  return Object.fromEntries(Object.entries(queryParams).filter(([, v]) => v))
}

export function useFilterEmptyQueryParams() {
  const queryParams = useParsedQueryString()
  const history = useHistory()

  useEffect(() => {
    history.replace({
      search: qs.stringify(filterEmptyQueryValues(queryParams)),
    })
  }, [history, queryParams])
}
