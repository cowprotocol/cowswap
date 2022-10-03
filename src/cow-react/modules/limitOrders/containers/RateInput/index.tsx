import * as styledEl from './styled'
import { useCallback } from 'react'
import { Lock, Unlock } from 'react-feather'
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
  const { isLocked, primaryField } = rateState.state
  const { setIsLocked } = rateState
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

  const atCurrency = stateMap[primaryField].currencyId
  const perCurrency = stateMap[secondaryField].currencyId

  // Lock icon
  const LockIcon = isLocked ? Unlock : Lock
  const handleLock = useCallback(() => {
    setIsLocked(!isLocked)
  }, [setIsLocked, isLocked])

  return (
    <styledEl.Wrapper>
      <styledEl.Header>
        <HeadingText atCurrency={atCurrency} perCurrency={perCurrency} />

        <styledEl.Lock onClick={handleLock}>
          <MouseoverTooltip text={<Trans>{LockTooltipText}</Trans>}>
            <LockIcon size={16} />
          </MouseoverTooltip>
        </styledEl.Lock>
      </styledEl.Header>
    </styledEl.Wrapper>
  )
}
