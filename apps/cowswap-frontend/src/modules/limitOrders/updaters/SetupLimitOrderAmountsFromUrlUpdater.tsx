import { useMemo } from 'react'

import { Price } from '@uniswap/sdk-core'

import { useSetupTradeAmountsFromUrl } from 'modules/trade'

import { TradeAmounts } from 'common/types'

import { useUpdateActiveRate } from '../hooks/useUpdateActiveRate'

export function SetupLimitOrderAmountsFromUrlUpdater() {
  const updateRate = useUpdateActiveRate()

  const params = useMemo(() => {
    return {
      onAmountsUpdate: (amounts: TradeAmounts) => {
        const activeRate = new Price({ baseAmount: amounts.inputAmount, quoteAmount: amounts.outputAmount })
        updateRate({ activeRate, isTypedValue: false, isRateFromUrl: true, isAlternativeOrderRate: false })
      },
    }
  }, [updateRate])

  useSetupTradeAmountsFromUrl(params)

  return null
}
