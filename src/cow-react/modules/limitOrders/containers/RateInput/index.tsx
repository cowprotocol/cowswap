import * as styledEl from './styled'
import { useCallback } from 'react'
import { RefreshCw } from 'react-feather'

import { Field } from 'state/swap/actions'
import { HeadingText } from '../../pure/RateInput/HeadingText'

import { useLimitRateStateManager } from 'cow-react/modules/limitOrders/state/limitRateAtom'
import { useLimitOrdersStateManager } from 'cow-react/modules/limitOrders/state/limitOrdersAtom'

export function RateInput() {
  // Rate state
  const rateState = useLimitRateStateManager()
  const { updateRate, setPrimaryField } = rateState
  const { primaryField, rateValue, isLoading } = rateState.state
  const secondaryField = primaryField === Field.INPUT ? Field.OUTPUT : Field.INPUT

  // Limit order state
  const limitOrderState = useLimitOrdersStateManager()
  const { inputCurrencyId, outputCurrencyId, inputCurrencyAmount, outputCurrencyAmount } = limitOrderState.state

  // State mapper
  const stateMap = {
    [Field.INPUT]: {
      currencyId: inputCurrencyId,
      currencyAmount: inputCurrencyAmount,
    },
    [Field.OUTPUT]: {
      currencyId: outputCurrencyId,
      currencyAmount: outputCurrencyAmount,
    },
  }
  const primaryCurrency = stateMap[primaryField].currencyId
  const secondaryCurrency = stateMap[secondaryField].currencyId

  // Handle set market price
  const handleSetMarketPrice = useCallback(() => {
    console.log('debug market price')
  }, [])

  // Handle rate input
  const handleUserInput = useCallback(
    (typedValue: string) => {
      updateRate(typedValue)
    },
    [updateRate]
  )

  // Handle toggle primary field
  const handleToggle = useCallback(() => {
    setPrimaryField(secondaryField)
  }, [secondaryField, setPrimaryField])

  return (
    <styledEl.Wrapper>
      <styledEl.Header>
        <HeadingText currency={secondaryCurrency} />

        <styledEl.MarketPriceButton onClick={handleSetMarketPrice}>
          <span>Market price</span>
        </styledEl.MarketPriceButton>
      </styledEl.Header>

      <styledEl.Body>
        <styledEl.InputWrapper>
          <styledEl.NumericalInput
            $loading={isLoading}
            className="rate-limit-amount-input"
            value={rateValue || ''}
            onUserInput={handleUserInput}
          />
        </styledEl.InputWrapper>

        <styledEl.ActiveCurrency onClick={handleToggle}>
          <styledEl.ActiveSymbol>{primaryCurrency}</styledEl.ActiveSymbol>
          <styledEl.ActiveIcon>
            {' '}
            <RefreshCw size={12} />
          </styledEl.ActiveIcon>
        </styledEl.ActiveCurrency>
      </styledEl.Body>
    </styledEl.Wrapper>
  )
}
