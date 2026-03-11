import { useMemo } from 'react'

import { useLocation } from 'react-router'

const TWAP_EOA_PROTOTYPE_QUERY_PARAM = 'twapEoaPrototype'

export function useIsTwapEoaPrototypeEnabled(): boolean {
  const { search, hash } = useLocation()

  return useMemo(() => {
    const values = [
      new URLSearchParams(search).get(TWAP_EOA_PROTOTYPE_QUERY_PARAM),
      // Support URLs like ?twapEoaPrototype=1#/advanced/...
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get(TWAP_EOA_PROTOTYPE_QUERY_PARAM)
        : null,
      // Support URLs like #/advanced/...?...&twapEoaPrototype=1
      new URLSearchParams(hash.split('?')[1] || '').get(TWAP_EOA_PROTOTYPE_QUERY_PARAM),
    ]

    const value = values.find(Boolean)?.toLowerCase()

    return value === '1' || value === 'true'
  }, [search, hash])
}
