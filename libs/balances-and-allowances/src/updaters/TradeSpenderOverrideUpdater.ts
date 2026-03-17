import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { Address } from '@cowprotocol/cow-sdk'

import { tradeSpenderAtom } from '../state/balancesAtom'

interface TradeSpenderOverrideUpdaterProps {
  spenderAddress?: Address
}

export function TradeSpenderOverrideUpdater({ spenderAddress }: TradeSpenderOverrideUpdaterProps): null {
  const setTradeSpender = useSetAtom(tradeSpenderAtom)

  useEffect(() => {
    setTradeSpender(spenderAddress)
    return () => setTradeSpender(undefined)
  }, [setTradeSpender, spenderAddress])

  return null
}
