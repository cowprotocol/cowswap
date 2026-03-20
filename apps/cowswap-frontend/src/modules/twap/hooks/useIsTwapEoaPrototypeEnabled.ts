import { useMemo } from 'react'

import { getIsTwapEoaPrototypeEnabled } from 'entities/twap'
import { useLocation } from 'react-router'

export function useIsTwapEoaPrototypeEnabled(): boolean {
  const { search, hash } = useLocation()

  return useMemo(() => getIsTwapEoaPrototypeEnabled(search, hash), [hash, search])
}
