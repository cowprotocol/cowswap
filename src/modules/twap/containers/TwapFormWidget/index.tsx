import { useAtomValue } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'

import { useAdvancedOrdersDerivedState } from 'modules/advancedOrders'
import { useIsWrapOrUnwrap } from 'modules/trade/hooks/useIsWrapOrUnwrap'
import { TradeNumberInput } from 'modules/trade/pure/TradeNumberInput'
import { TradeTextBox } from 'modules/trade/pure/TradeTextBox'
import { QuoteObserverUpdater } from 'modules/twap/updaters/QuoteObserverUpdater'

import { useRateInfoParams } from 'common/hooks/useRateInfoParams'

import * as styledEl from './styled'

import { DEFAULT_TWAP_SLIPPAGE, orderDeadlines, defaultNumOfParts } from '../../const'
import { AmountParts } from '../../pure/AmountParts'
import { DeadlineSelector } from '../../pure/DeadlineSelector'
import { partsStateAtom } from '../../state/partsStateAtom'
import { twapTimeIntervalAtom } from '../../state/twapOrderAtom'
import { twapOrdersSettingsAtom, updateTwapOrdersSettingsAtom } from '../../state/twapOrdersSettingsAtom'
import { deadlinePartsDisplay } from '../../utils/deadlinePartsDisplay'
import { ActionButtons } from '../ActionButtons'
import { TwapConfirmModal } from '../TwapConfirmModal'


interface LabelTooltipObject {
  label: string
  tooltip?: JSX.Element
}

export interface LabelTooltip {
  [key: string]: LabelTooltipObject
}

export function TwapFormWidget() {
  const { numberOfPartsValue, slippageValue, deadline, customDeadline, isCustomDeadline } =
    useAtomValue(twapOrdersSettingsAtom)
  const { inputCurrencyAmount, outputCurrencyAmount } = useAdvancedOrdersDerivedState()
  const partsState = useAtomValue(partsStateAtom)
  const timeInterval = useAtomValue(twapTimeIntervalAtom)
  const updateState = useUpdateAtom(updateTwapOrdersSettingsAtom)
  const isWrapOrUnwrap = useIsWrapOrUnwrap()

  const rateInfoParams = useRateInfoParams(inputCurrencyAmount, outputCurrencyAmount)

  const deadlineState = {
    deadline,
    customDeadline,
    isCustomDeadline,
  }

  const LABELS_TOOLTIPS: LabelTooltip = {
    numberOfParts: {
      label: "No. of parts",
      tooltip: <>Your TWAP order will be split into this many parts, which will execute one by one.</>,
    },
    partDuration: {
      label: "Part duration",
      tooltip: <>The "Part duration" refers to the duration between each part of your TWAP order.
        Choosing a shorter time allows for faster execution of each part, potentially reducing price fluctuations. Striking the right balance is crucial for optimal execution.</>,
    },
    slippage: {
      label: "Slippage",
      tooltip: <>This slippage will apply to each part of your order. Since a TWAP order executes over a longer period of time, your slippage should take into account possible price fluctuations over that time. If your slippage is too low, you risk some parts of your order failing to execute.</>,
    },
    price: {
      label: "Current market price"
    },
    sellAmount: {
      label: "Sell amount per part",
      tooltip: <>Estimated amount that will be sold in each part of the order.</>
    },
    buyAmount: {
      label: "Buy amount per part",
      tooltip: <>Estimated amount that you will receive from each part of the order.</>
    },
  };

  const AMOUNTPARTS_LABELS = {
    sellAmount: LABELS_TOOLTIPS.sellAmount,
    buyAmount: LABELS_TOOLTIPS.buyAmount,
  };
  
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
          onUserInput={(value: number | null) => updateState({ numberOfPartsValue: value || defaultNumOfParts })}
          min={defaultNumOfParts}
          max={100}
          label={LABELS_TOOLTIPS.numberOfParts.label}
          hint={LABELS_TOOLTIPS.numberOfParts.tooltip}
        />
        <TradeNumberInput
          value={slippageValue}
          onUserInput={(value: number | null) => updateState({ slippageValue: value })}
          decimalsPlaces={2}
          placeholder={DEFAULT_TWAP_SLIPPAGE.toFixed(1)}
          max={50}
          label={LABELS_TOOLTIPS.slippage.label}
          hint={LABELS_TOOLTIPS.slippage.tooltip}
          suffix="%"
        />
      </styledEl.Row>

      <AmountParts partsState={partsState} labels={AMOUNTPARTS_LABELS}/>

      <styledEl.Row>
        <DeadlineSelector deadline={deadlineState} items={orderDeadlines} setDeadline={(value) => updateState(value)} />

        <TradeTextBox label={LABELS_TOOLTIPS.partDuration.label} hint={LABELS_TOOLTIPS.partDuration.label}>
          <>{deadlinePartsDisplay(timeInterval)}</>
        </TradeTextBox>
      </styledEl.Row>

      <ActionButtons />
    </>
  )
}
