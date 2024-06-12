import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { useTradeTypeInfoFromUrl } from './useTradeTypeInfoFromUrl'

import { tradeTypeAtom } from '../state/tradeTypeAtom'
import { TradeTypeInfo } from '../types'

export function useSetupTradeTypeInfo(): TradeTypeInfo | null {
  const setTradeType = useSetAtom(tradeTypeAtom)

  const type = useTradeTypeInfoFromUrl()

  useEffect(() => {
    setTradeType(type)
  }, [type, setTradeType])

  return type
}
