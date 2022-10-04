import * as styledEl from './styled'
import { useCallback } from 'react'
import { RefreshCw } from 'react-feather'

import { HeadingText } from '../../pure/RateInput/HeadingText'
import { useLimitRateStateManager } from 'cow-react/modules/limitOrders/state/limitRateAtom'
import { useLimitOrdersStateManager } from 'cow-react/modules/limitOrders/state/limitOrdersAtom'

export function RateInput() {
  // Rate state
  const rateState = useLimitRateStateManager()
  const { setActiveRate, setIsInversed } = rateState
  const { isInversed, activeRate, isLoading } = rateState.state

  // Limit order state
  const limitOrderState = useLimitOrdersStateManager()
  const { inputCurrencyId, outputCurrencyId, inputCurrencyAmount, outputCurrencyAmount } = limitOrderState.state
  const inputValue = Number(inputCurrencyAmount)
  const outputValue = Number(outputCurrencyAmount)

  const primaryCurrency = isInversed ? outputCurrencyId : inputCurrencyId
  const secondaryCurrency = isInversed ? inputCurrencyId : outputCurrencyId

  // Handle set market price
  const handleSetMarketPrice = useCallback(() => {
    console.log('debug market price')
  }, [])

  // Handle rate input
  const handleUserInput = useCallback(
    (typedValue: string) => {
      setActiveRate(Number(typedValue))
    },
    [setActiveRate]
  )

  // Handle toggle primary field
  const handleToggle = () => {
    let newRate

    if (!isInversed) {
      newRate = inputValue / outputValue
    } else {
      newRate = outputValue / inputValue
    }

    setIsInversed(!isInversed, newRate)
  }

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
