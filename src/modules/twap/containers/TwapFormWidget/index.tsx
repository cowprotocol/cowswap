import { useAtomValue } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'

import {
  useAdvancedOrdersDerivedState,
  useAdvancedOrdersRawState,
  useUpdateAdvancedOrdersRawState,
} from 'modules/advancedOrders'
import { useTradeConfirmActions } from 'modules/trade'
import { useIsWrapOrUnwrap } from 'modules/trade/hooks/useIsWrapOrUnwrap'
import { TradeNumberInput } from 'modules/trade/pure/TradeNumberInput'
import { TradeTextBox } from 'modules/trade/pure/TradeTextBox'
import { QuoteObserverUpdater } from 'modules/twap/updaters/QuoteObserverUpdater'

import { useRateInfoParams } from 'common/hooks/useRateInfoParams'

import * as styledEl from './styled'

import { DEFAULT_TWAP_SLIPPAGE, orderDeadlines, defaultNumOfParts } from '../../const'
import { useSetupFallbackHandler } from '../../hooks/useSetupFallbackHandler'
import { useTwapFormState } from '../../hooks/useTwapFormState'
import { AmountParts } from '../../pure/AmountParts'
import { DeadlineSelector } from '../../pure/DeadlineSelector'
import { PrimaryActionButton } from '../../pure/PrimaryActionButton'
import { partsStateAtom } from '../../state/partsStateAtom'
import { twapTimeIntervalAtom } from '../../state/twapOrderAtom'
import { twapOrdersSettingsAtom, updateTwapOrdersSettingsAtom } from '../../state/twapOrdersSettingsAtom'
import { deadlinePartsDisplay } from '../../utils/deadlinePartsDisplay'
import { TwapConfirmModal } from '../TwapConfirmModal'

export function TwapFormWidget() {
  const { numberOfPartsValue, slippageValue, deadline, customDeadline, isCustomDeadline } =
    useAtomValue(twapOrdersSettingsAtom)

  const { inputCurrencyAmount, outputCurrencyAmount } = useAdvancedOrdersDerivedState()
  const { inputCurrencyAmount: rawInputCurrencyAmount } = useAdvancedOrdersRawState()
  const updateRawState = useUpdateAdvancedOrdersRawState()

  const partsState = useAtomValue(partsStateAtom)
  const timeInterval = useAtomValue(twapTimeIntervalAtom)
  const updateSettingsState = useUpdateAtom(updateTwapOrdersSettingsAtom)
  const isWrapOrUnwrap = useIsWrapOrUnwrap()

  const setFallbackHandler = useSetupFallbackHandler()
  const tradeConfirmActions = useTradeConfirmActions()
  const formState = useTwapFormState()

  const rateInfoParams = useRateInfoParams(inputCurrencyAmount, outputCurrencyAmount)

  const primaryActionContext = {
    setFallbackHandler,
    openConfirmModal: tradeConfirmActions.onOpen,
  }

  const deadlineState = {
    deadline,
    customDeadline,
    isCustomDeadline,
  }

  // Reset output amount when num of parts or input amount are changed
  useEffect(() => {
    updateRawState({ outputCurrencyAmount: null })
  }, [updateRawState, numberOfPartsValue, rawInputCurrencyAmount])

  return (
    <>
      <QuoteObserverUpdater />
      <TwapConfirmModal />

      {!isWrapOrUnwrap && (
        <styledEl.Row>
          <styledEl.StyledRateInfo label="Current market price" rateInfoParams={rateInfoParams} />
        </styledEl.Row>
      )}

      <styledEl.Row>
        <TradeNumberInput
          value={numberOfPartsValue}
          onUserInput={(value: number | null) =>
            updateSettingsState({ numberOfPartsValue: value || defaultNumOfParts })
          }
          min={defaultNumOfParts}
          max={100}
          label="No. of parts"
          hint="Todo: No of parts hint"
        />
        <TradeNumberInput
          value={slippageValue}
          onUserInput={(value: number | null) => updateSettingsState({ slippageValue: value })}
          decimalsPlaces={2}
          placeholder={DEFAULT_TWAP_SLIPPAGE.toFixed(1)}
          max={50}
          label="Slippage"
          hint="Todo: Slippage hint"
          suffix="%"
        />
      </styledEl.Row>

      <AmountParts partsState={partsState} />

      <styledEl.DeadlineRow>
        <DeadlineSelector
          deadline={deadlineState}
          items={orderDeadlines}
          setDeadline={(value) => updateSettingsState(value)}
        />

        <TradeTextBox label="Part every" hint="TODO: part every tooltip">
          <>{deadlinePartsDisplay(timeInterval)}</>
        </TradeTextBox>
      </styledEl.DeadlineRow>

      <PrimaryActionButton state={formState} context={primaryActionContext} />
    </>
  )
}
