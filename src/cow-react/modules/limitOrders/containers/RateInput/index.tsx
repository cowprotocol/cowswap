import * as styledEl from './styled'
import { useCallback, useEffect } from 'react'
import { RefreshCw } from 'react-feather'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'

import { HeadingText } from '../../pure/RateInput/HeadingText'
import { useLimitRateStateManager } from 'cow-react/modules/limitOrders/state/limitRateAtom'
import { limitOrdersAtom, updateLimitOrdersAtom } from '@cow/modules/limitOrders/state/limitOrdersAtom'
import { useCalculateRate } from '../../hooks/useCalculateRate'

export function RateInput() {
  // Rate state
  const rateState = useLimitRateStateManager()
  const { setActiveRate, setIsInversed } = rateState
  const { isInversed, activeRate, isLoading, marketRate } = rateState.state

  const calculateRate = useCalculateRate()

  // Limit order state
  const limitOrderState = useAtomValue(limitOrdersAtom)
  const updateLimitOrdersState = useUpdateAtom(updateLimitOrdersAtom)
  const { inputCurrencyId, outputCurrencyId, inputCurrencyAmount } = limitOrderState

  const primaryCurrency = isInversed ? outputCurrencyId : inputCurrencyId
  const secondaryCurrency = isInversed ? inputCurrencyId : outputCurrencyId

  // Handle set market price
  const handleSetMarketPrice = useCallback(() => {
    setActiveRate(marketRate)
  }, [marketRate, setActiveRate])

  // Handle rate input
  const handleUserInput = useCallback(
    (typedValue: string) => {
      setActiveRate(typedValue)
    },
    [setActiveRate]
  )

  // Handle toggle primary field
  const handleToggle = () => {
    const newRate = calculateRate()
    setIsInversed(!isInversed, newRate)
  }

  // Handle rate change
  useEffect(() => {
    updateLimitOrdersState({ inputCurrencyAmount })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRate])

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
