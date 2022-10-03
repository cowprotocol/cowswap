import * as styledEl from './styled'
import { useCallback, useMemo, useEffect } from 'react'
import { Lock, Unlock, RefreshCw } from 'react-feather'
import { Trans } from '@lingui/macro'

import { Field } from 'state/swap/actions'
import { MouseoverTooltip } from 'components/Tooltip'
import { HeadingText } from '../../pure/RateInput/HeadingText'

import { useLimitRateStateManager } from 'cow-react/modules/limitOrders/state/limitRateAtom'
import { useLimitOrdersStateManager } from 'cow-react/modules/limitOrders/state/limitOrdersAtom'

const LockTooltipText =
  'Lock the rate field to get your buy amount automatically adjusted when changing your sell amount'

export function RateInput() {
  // Rate state
  const rateState = useLimitRateStateManager()
  const { setIsLocked, setRateValue, setPrimaryField } = rateState
  const { isLocked, primaryField, rateValue, isLoading } = rateState.state
  const secondaryField = primaryField === Field.INPUT ? Field.OUTPUT : Field.INPUT

  // Limit order state
  const limitOrderState = useLimitOrdersStateManager()
  const { inputCurrencyId, outputCurrencyId, inputCurrencyAmount, outputCurrencyAmount } = limitOrderState.state

  // State mapper
  const { primaryCurrency, secondaryCurrency, primaryAmount, secondaryAmount } = useMemo(() => {
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
    return {
      primaryCurrency: stateMap[primaryField].currencyId,
      secondaryCurrency: stateMap[secondaryField].currencyId,
      primaryAmount: Number(stateMap[primaryField].currencyAmount),
      secondaryAmount: Number(stateMap[secondaryField].currencyAmount),
    }
  }, [inputCurrencyAmount, inputCurrencyId, outputCurrencyAmount, outputCurrencyId, primaryField, secondaryField])

  // Lock icon
  const LockIcon = isLocked ? Unlock : Lock
  const handleLock = useCallback(() => {
    setIsLocked(!isLocked)
  }, [setIsLocked, isLocked])

  // Handle rate input
  const handleUserInput = useCallback(
    (typedValue: string) => {
      setRateValue(typedValue)
    },
    [setRateValue]
  )

  // Handle toggle primary field
  const handleTogglePrimary = useCallback(() => {
    setPrimaryField(secondaryField)
  }, [secondaryField, setPrimaryField])

  // Handle initial value
  useEffect(() => {
    if (!primaryAmount || !secondaryAmount) {
      return
    }

    const newRateValue = primaryAmount / secondaryAmount
    setRateValue(newRateValue)
  }, [primaryAmount, secondaryAmount])

  // Handle swap tokens
  // useEffect(() => {})

  return (
    <styledEl.Wrapper>
      <styledEl.Header>
        <HeadingText atCurrency={primaryCurrency} perCurrency={secondaryCurrency} />

        <styledEl.Lock onClick={handleLock}>
          <MouseoverTooltip text={<Trans>{LockTooltipText}</Trans>}>
            <LockIcon size={16} />
          </MouseoverTooltip>
        </styledEl.Lock>
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

        <styledEl.ActiveCurrency onClick={handleTogglePrimary}>
          <styledEl.ActiveSymbol>{primaryCurrency}</styledEl.ActiveSymbol>
          <RefreshCw size={14} />
        </styledEl.ActiveCurrency>
      </styledEl.Body>
    </styledEl.Wrapper>
  )
}
