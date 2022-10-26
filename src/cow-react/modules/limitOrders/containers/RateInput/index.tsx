import * as styledEl from './styled'
import { useCallback, useEffect } from 'react'
import { RefreshCw } from 'react-feather'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'

import { HeadingText } from '@cow/modules/limitOrders/pure/RateInput/HeadingText'
import { limitRateAtom, updateLimitRateAtom } from '@cow/modules/limitOrders/state/limitRateAtom'
import { useCalculateRate } from '@cow/modules/limitOrders/hooks/useCalculateRate'
import { useUpdateCurrencyAmount } from '@cow/modules/limitOrders/hooks/useUpdateCurrencyAmount'
import { useLimitOrdersTradeState } from '@cow/modules/limitOrders/hooks/useLimitOrdersTradeState'
import { useFetchInitialPrice } from '@cow/modules/limitOrders/hooks/useFetchInitialPrice'
import { useFetchMarketPrice } from '@cow/modules/limitOrders/hooks/useFetchMarketPrice'
import usePrevious from 'hooks/usePrevious'

export function RateInput() {
  // Continous market price fetch (quote)
  useFetchMarketPrice()

  // Initial price fetch
  const { price: initialPrice } = useFetchInitialPrice()

  // Rate and currency amount hooks
  const calculateRate = useCalculateRate()
  const updateCurrencyAmount = useUpdateCurrencyAmount()

  // Rate state
  const { isInversed, activeRate, isLoading, executionRate } = useAtomValue(limitRateAtom)
  const updateLimitRateState = useUpdateAtom(updateLimitRateAtom)
  const prevIsInversed = usePrevious(isInversed)

  // Limit order state
  const { inputCurrency, outputCurrency, inputCurrencyAmount } = useLimitOrdersTradeState()
  const inputCurrencyId = inputCurrency?.symbol
  const outputCurrencyId = outputCurrency?.symbol

  const primaryCurrency = isInversed ? outputCurrencyId : inputCurrencyId
  const secondaryCurrency = isInversed ? inputCurrencyId : outputCurrencyId

  // Handle set market price
  const handleSetMarketPrice = useCallback(() => {
    updateLimitRateState({ activeRate: executionRate })
  }, [executionRate, updateLimitRateState])

  // Handle rate input
  const handleUserInput = useCallback(
    (typedValue: string) => {
      updateLimitRateState({ activeRate: typedValue })
    },
    [updateLimitRateState]
  )

  // Handle toggle primary field
  const handleToggle = () => {
    updateLimitRateState({ isInversed: !isInversed, activeRate: calculateRate() })
  }

  // Observe the active rate change and set the INPUT currency amount
  // which will apply new rate to OUTPUT currency amount
  // Don't call this when the rate changes as a result of click on inverse button
  // because in that case we don't want to recalculate anything
  useEffect(() => {
    if (isInversed === prevIsInversed) {
      updateCurrencyAmount({
        inputCurrencyAmount: inputCurrencyAmount?.toExact(),
        keepOrderKind: true,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRate])

  // Set initial active rate
  useEffect(() => {
    updateLimitRateState({ activeRate: initialPrice })
  }, [initialPrice, updateLimitRateState])

  return (
    <styledEl.Wrapper>
      <styledEl.Header>
        <HeadingText currency={primaryCurrency} />

        <styledEl.MarketPriceButton onClick={handleSetMarketPrice}>
          <span>Market price</span>
        </styledEl.MarketPriceButton>
      </styledEl.Header>

      <styledEl.Body>
        <styledEl.InputWrapper>
          <styledEl.NumericalInput
            $loading={isLoading}
            className="rate-limit-amount-input"
            value={activeRate || ''}
            onUserInput={handleUserInput}
          />
        </styledEl.InputWrapper>

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
