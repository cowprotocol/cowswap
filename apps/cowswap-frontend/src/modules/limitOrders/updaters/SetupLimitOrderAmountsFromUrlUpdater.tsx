import { useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'

import { usePrevious } from '@cowprotocol/common-hooks'
import { Fraction, Price } from '@cowprotocol/currency'
import { useWalletInfo } from '@cowprotocol/wallet'

import { getPercentageRate, useSetupTradeAmountsFromUrl } from 'modules/trade'

import { TRADE_URL_PRICE_PERCENTAGE_KEY } from 'common/modules/tradeNavigation'
import { TradeAmounts } from 'common/types'

import { useLimitOrdersRawState, useUpdateLimitOrdersRawState } from '../hooks/useLimitOrdersRawState'
import { useUpdateActiveRate } from '../hooks/useUpdateActiveRate'
import { updateLimitOrdersSettingsAtom } from '../state/limitOrdersSettingsAtom'
import { updateLimitRateAtom } from '../state/limitRateAtom'
import { partiallyFillableOverrideAtom } from '../state/partiallyFillableOverride'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function SetupLimitOrderAmountsFromUrlUpdater() {
  const updateRate = useUpdateActiveRate()
  const updateRateState = useSetAtom(updateLimitRateAtom)
  const updateRawState = useUpdateLimitOrdersRawState()
  const updateSettings = useSetAtom(updateLimitOrdersSettingsAtom)
  const setPartiallyFillableOverride = useSetAtom(partiallyFillableOverrideAtom)
  const { account } = useWalletInfo()

  const { inputCurrencyId, outputCurrencyId, chainId } = useLimitOrdersRawState()
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

  useEffect(() => {
    return () => updateRateState({ percentageSelection: null, focusCustomPercentage: false })
  }, [tokensPair, chainId, account, updateRateState])

  const params = useMemo(() => {
    return {
      onSetup: (params: URLSearchParams) => {
        const percentage = params.get(TRADE_URL_PRICE_PERCENTAGE_KEY)
        if (!percentage) return
        const isCustom = percentage === 'custom'
        if (
          !isCustom &&
          (!/^\d+(?:\.\d{1,2})?$/.test(percentage) || !getPercentageRate(new Fraction(1), percentage, false))
        ) {
          return
        }

        updateRawState({ outputCurrencyAmount: null, recipient: null, recipientAddress: null, isUnlocked: true })
        updateRateState({
          activeRate: null,
          typedValue: null,
          isTypedValue: false,
          isInverted: false,
          isRateFromUrl: true,
          isAlternativeOrderRate: false,
          percentageSelection: isCustom ? null : { value: percentage, isInverted: false },
          focusCustomPercentage: isCustom,
        })
        updateSettings({ showRecipient: false })
        setPartiallyFillableOverride(undefined)
      },
      onAmountsUpdate: (amounts: TradeAmounts) => {
        const activeRate = new Price({ baseAmount: amounts.inputAmount, quoteAmount: amounts.outputAmount })
        updateRate({ activeRate, isTypedValue: false, isRateFromUrl: true, isAlternativeOrderRate: false })
      },
    }
  }, [updateRate, updateRateState, updateRawState, updateSettings, setPartiallyFillableOverride])

  useSetupTradeAmountsFromUrl(params)

  return null
}
