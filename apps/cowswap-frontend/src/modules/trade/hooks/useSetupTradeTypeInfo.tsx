import { useSetAtom } from 'jotai'
import { useLayoutEffect } from 'react'

import { TradeTypeInfo, useTradeTypeInfoFromUrl } from 'common/modules/tradeNavigation'

import { tradeTypeAtom } from '../state/tradeTypeAtom'

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
