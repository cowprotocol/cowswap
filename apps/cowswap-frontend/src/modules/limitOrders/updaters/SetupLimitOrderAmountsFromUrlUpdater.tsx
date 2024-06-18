import { useCallback } from 'react'

import { Price } from '@uniswap/sdk-core'

import { useSetupTradeAmountsFromUrl } from 'modules/trade'

import { TradeAmounts } from 'common/types'

import { useUpdateActiveRate } from '../hooks/useUpdateActiveRate'

export function SetupLimitOrderAmountsFromUrlUpdater() {
  const updateRate = useUpdateActiveRate()

  const onAmountsUpdate = useCallback(
    (amounts: TradeAmounts) => {
      const activeRate = new Price({ baseAmount: amounts.inputAmount, quoteAmount: amounts.outputAmount })
      updateRate({ activeRate, isTypedValue: false, isRateFromUrl: true, isAlternativeOrderRate: false })
    },
    [updateRate]
  )

  useSetupTradeAmountsFromUrl({ onAmountsUpdate })

  return null
}
