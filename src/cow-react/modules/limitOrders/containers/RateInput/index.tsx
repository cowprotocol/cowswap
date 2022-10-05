import * as styledEl from './styled'
import { useCallback, useEffect } from 'react'
import { RefreshCw } from 'react-feather'

import { HeadingText } from '../../pure/RateInput/HeadingText'
import { limitDecimals } from '../../hooks/useApplyLimitRate'
import { useLimitRateStateManager } from 'cow-react/modules/limitOrders/state/limitRateAtom'
import { useLimitOrdersStateManager } from 'cow-react/modules/limitOrders/state/limitOrdersAtom'

export function RateInput() {
  // Rate state
  const rateState = useLimitRateStateManager()
  const { setActiveRate, setIsInversed } = rateState
  const { isInversed, activeRate, isLoading, marketRate } = rateState.state

  // Limit order state
  const limitOrderState = useLimitOrdersStateManager()
  const { inputCurrencyId, outputCurrencyId, inputCurrencyAmount, outputCurrencyAmount } = limitOrderState.state
  const { setInputCurrencyAmount } = limitOrderState

  const inputValue = Number(inputCurrencyAmount)
  const outputValue = Number(outputCurrencyAmount)

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
    let newRate

    if (!activeRate) {
      newRate = null
    } else if (isInversed) {
      newRate = outputValue / inputValue
    } else {
      newRate = inputValue / outputValue
    }

    if (newRate !== null) {
      newRate = String(limitDecimals(newRate, 4))
    }

    setIsInversed(!isInversed, newRate)
  }

  // Handle rate change
  useEffect(() => {
    setInputCurrencyAmount(inputCurrencyAmount)
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
