import * as styledEl from './styled'
import { useCallback, useMemo } from 'react'
import { RefreshCw } from 'react-feather'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'

import { HeadingText } from '@cow/modules/limitOrders/pure/RateInput/HeadingText'
import { limitRateAtom, updateLimitRateAtom } from '@cow/modules/limitOrders/state/limitRateAtom'
import { useLimitOrdersTradeState } from '@cow/modules/limitOrders/hooks/useLimitOrdersTradeState'
import { toFraction } from '@cow/modules/limitOrders/utils/toFraction'
import { useRateImpact } from '@cow/modules/limitOrders/hooks/useRateImpact'
import { isFractionFalsy } from '@cow/utils/isFractionFalsy'
import { formatSmart } from 'utils/format'

export function RateInput() {
  // Rate state
  const {
    isInversed,
    activeRate,
    isLoading,
    executionRate,
    isLoadingExecutionRate,
    typedValue,
    isTypedValue,
    initialRate,
  } = useAtomValue(limitRateAtom)
  const updateLimitRateState = useUpdateAtom(updateLimitRateAtom)

  // Limit order state
  const { inputCurrency, outputCurrency } = useLimitOrdersTradeState()
  const rateImpact = useRateImpact()
  const areBothCurrencies = !!inputCurrency && !!outputCurrency
  const inputCurrencyId = inputCurrency?.symbol
  const outputCurrencyId = outputCurrency?.symbol

  const primaryCurrency = isInversed ? outputCurrencyId : inputCurrencyId
  const secondaryCurrency = isInversed ? inputCurrencyId : outputCurrencyId

  // Handle rate display
  const displayedRate = useMemo(() => {
    if (isTypedValue) return typedValue || ''
    else if (!activeRate || !areBothCurrencies || activeRate.equalTo(0)) return ''

    const rate = isInversed ? activeRate.invert() : activeRate

    return formatSmart(rate) || ''
  }, [activeRate, areBothCurrencies, isInversed, isTypedValue, typedValue])

  // Handle set market price
  const handleSetMarketPrice = useCallback(() => {
    updateLimitRateState({
      activeRate: isFractionFalsy(executionRate) ? initialRate : executionRate,
      isTypedValue: false,
    })
  }, [executionRate, initialRate, updateLimitRateState])

  // Handle rate input
  const handleUserInput = useCallback(
    (typedValue: string) => {
      updateLimitRateState({ typedValue, activeRate: toFraction(typedValue, isInversed), isTypedValue: true })
    },
    [isInversed, updateLimitRateState]
  )

  // Handle toggle primary field
  const handleToggle = () => {
    updateLimitRateState({ isInversed: !isInversed, isTypedValue: false })
  }

  const isDisabledMPrice = useMemo(() => {
    if (isLoadingExecutionRate) return true

    if (!outputCurrencyId || !inputCurrencyId) return true

    if (executionRate) {
      return activeRate?.equalTo(executionRate)
    } else {
      return !!initialRate && activeRate?.equalTo(initialRate)
    }
  }, [activeRate, executionRate, isLoadingExecutionRate, initialRate, inputCurrencyId, outputCurrencyId])

  return (
    <styledEl.Wrapper>
      <styledEl.Header>
        <HeadingText inputCurrency={inputCurrency} currency={primaryCurrency} rateImpact={rateImpact} />

        <styledEl.MarketPriceButton disabled={isDisabledMPrice} onClick={handleSetMarketPrice}>
          <span>Market price</span>
        </styledEl.MarketPriceButton>
      </styledEl.Header>

      <styledEl.Body>
        {isLoading && areBothCurrencies ? (
          <styledEl.RateLoader />
        ) : (
          <styledEl.NumericalInput
            $loading={false}
            className="rate-limit-amount-input"
            value={displayedRate}
            onUserInput={handleUserInput}
          />
        )}

        <styledEl.ActiveCurrency onClick={handleToggle}>
          <styledEl.ActiveSymbol>{secondaryCurrency}</styledEl.ActiveSymbol>
          <styledEl.ActiveIcon>
            <RefreshCw size={12} />
          </styledEl.ActiveIcon>
        </styledEl.ActiveCurrency>
      </styledEl.Body>
    </styledEl.Wrapper>
  )
}
