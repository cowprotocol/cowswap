import { useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'

import { usePrevious } from '@cowprotocol/common-hooks'
import { Price } from '@uniswap/sdk-core'

import { useSetupTradeAmountsFromUrl } from 'modules/trade'

import { TradeAmounts } from 'common/types'

import { useLimitOrdersRawState } from '../hooks/useLimitOrdersRawState'
import { useUpdateActiveRate } from '../hooks/useUpdateActiveRate'
import { updateLimitRateAtom } from '../state/limitRateAtom'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function SetupLimitOrderAmountsFromUrlUpdater() {
  const updateRate = useUpdateActiveRate()
  const updateRateState = useSetAtom(updateLimitRateAtom)

  const { inputCurrencyId, outputCurrencyId } = useLimitOrdersRawState()
  const tokensPair = `${inputCurrencyId || ''}${outputCurrencyId || ''}`
  const prevTokensPair = usePrevious(tokensPair)

  /**
   * In useUpdateActiveRate() we have a logic which depends on isRateFromUrl flag
   * Mainly, it serves for keeping amounts static after coming from another trade widget
   * But we should not prevent amounts and price update when we change tokens
   * So, we reset isRateFromUrl flag when at least one of the tokens is changed
   */
  useEffect(() => {
    if (!tokensPair || !prevTokensPair || tokensPair === prevTokensPair) return

    updateRateState({ isRateFromUrl: false })
  }, [tokensPair, prevTokensPair, updateRateState])

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
