import { useSetAtom } from 'jotai'
import { useLayoutEffect } from 'react'

import { useTradeTypeInfoFromUrl } from './useTradeTypeInfoFromUrl'

import { tradeTypeAtom } from '../state/tradeTypeAtom'
import { TradeTypeInfo } from '../types'

export function useSetupTradeTypeInfo(): TradeTypeInfo | null {
  const setTradeType = useSetAtom(tradeTypeAtom)

  const type = useTradeTypeInfoFromUrl()

  // useLayoutEffect so tradeTypeAtom is set before paint and before quote/price logic runs;
  // same phase as HydrateAtom's swapDerivedStateAtom update, so derivedTradeStateAtom has correct value.
  useLayoutEffect(() => {
    setTradeType(type)
  }, [type, setTradeType])

  return type
}
