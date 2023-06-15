import { useAtomValue } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'

import { renderTooltip } from 'legacy/components/Tooltip'

import {
  useAdvancedOrdersDerivedState,
  useAdvancedOrdersRawState,
  useUpdateAdvancedOrdersRawState,
} from 'modules/advancedOrders'
import { useIsWrapOrUnwrap } from 'modules/trade/hooks/useIsWrapOrUnwrap'
import { TradeNumberInput } from 'modules/trade/pure/TradeNumberInput'
import { TradeTextBox } from 'modules/trade/pure/TradeTextBox'
import { QuoteObserverUpdater } from 'modules/twap/updaters/QuoteObserverUpdater'

import { useRateInfoParams } from 'common/hooks/useRateInfoParams'

import * as styledEl from './styled'
import { LABELS_TOOLTIPS } from './tooltips'

import { DEFAULT_TWAP_SLIPPAGE, orderDeadlines, defaultNumOfParts } from '../../const'
import { AmountParts } from '../../pure/AmountParts'
import { DeadlineSelector } from '../../pure/DeadlineSelector'
import { partsStateAtom } from '../../state/partsStateAtom'
import { twapTimeIntervalAtom } from '../../state/twapOrderAtom'
import { twapOrdersSettingsAtom, updateTwapOrdersSettingsAtom } from '../../state/twapOrdersSettingsAtom'
import { deadlinePartsDisplay } from '../../utils/deadlinePartsDisplay'
import { ActionButtons } from '../ActionButtons'
import { TwapConfirmModal } from '../TwapConfirmModal'

export type { LabelTooltipObject, LabelTooltipItems } from './tooltips'

const AMOUNTPARTS_LABELS = {
  sellAmount: LABELS_TOOLTIPS.sellAmount,
  buyAmount: LABELS_TOOLTIPS.buyAmount,
}

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

  const rateInfoParams = useRateInfoParams(inputCurrencyAmount, outputCurrencyAmount)

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
          <styledEl.StyledRateInfo label={LABELS_TOOLTIPS.price.label} rateInfoParams={rateInfoParams} />
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
          label={LABELS_TOOLTIPS.numberOfParts.label}
          tooltip={renderTooltip(LABELS_TOOLTIPS.numberOfParts.tooltip)}
        />
        <TradeNumberInput
          value={slippageValue}
          onUserInput={(value: number | null) => updateSettingsState({ slippageValue: value })}
          decimalsPlaces={2}
          placeholder={DEFAULT_TWAP_SLIPPAGE.toFixed(1)}
          max={50}
          label={LABELS_TOOLTIPS.slippage.label}
          tooltip={renderTooltip(LABELS_TOOLTIPS.slippage.tooltip)}
          suffix="%"
        />
      </styledEl.Row>

      <AmountParts partsState={partsState} labels={AMOUNTPARTS_LABELS} />

      <styledEl.Row>
        <DeadlineSelector
          deadline={deadlineState}
          items={orderDeadlines}
          setDeadline={(value) => updateSettingsState(value)}
          label={LABELS_TOOLTIPS.totalDuration.label}
          tooltip={renderTooltip(LABELS_TOOLTIPS.totalDuration.tooltip, {
            parts: numberOfPartsValue,
            partDuration: timeInterval,
          })}
        />

        <TradeTextBox label={LABELS_TOOLTIPS.partDuration.label} tooltip={LABELS_TOOLTIPS.partDuration.tooltip}>
          <>{deadlinePartsDisplay(timeInterval)}</>
        </TradeTextBox>
      </styledEl.Row>

      <ActionButtons />
    </>
  )
}
