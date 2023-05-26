import * as styledEl from './styled'
import { TradeNumberInput } from 'modules/trade/pure/TradeNumberInput'
import { TradeTextBox } from 'modules/trade/pure/TradeTextBox'
import { AmountParts } from '../../pure/AmountParts'
import { useAtomValue } from 'jotai'
import { twapOrdersSettingsAtom, updateTwapOrdersSettingsAtom } from '../../state/twapOrdersSettingsAtom'
import { useUpdateAtom } from 'jotai/utils'
import { partsStateAtom } from '../../state/partsStateAtom'
import { DeadlineSelector } from '../../pure/DeadlineSelector'
import { DEFAULT_TWAP_SLIPPAGE, orderDeadlines, defaultNumOfParts } from '../../const'
import { deadlinePartsDisplay } from '../../utils/deadlinePartsDisplay'
import { PrimaryActionButton } from '../../pure/PrimaryActionButton'
import { useTwapFormActions } from '../../hooks/useTwapFormActions'
import { useTwapFormState } from '../../hooks/useTwapFormState'
import { twapTimeIntervalAtom } from '../../state/twapOrderAtom'

export function TwapFormWidget() {
  const { numberOfPartsValue, slippageValue, deadline, customDeadline, isCustomDeadline } =
    useAtomValue(twapOrdersSettingsAtom)
  const partsState = useAtomValue(partsStateAtom)
  const timeInterval = useAtomValue(twapTimeIntervalAtom)
  const updateState = useUpdateAtom(updateTwapOrdersSettingsAtom)

  const formActions = useTwapFormActions()
  const formState = useTwapFormState()

  const deadlineState = {
    deadline,
    customDeadline,
    isCustomDeadline,
  }

  return (
    <>
      <styledEl.Row>
        <TradeNumberInput
          value={numberOfPartsValue}
          onUserInput={(value: number | null) => updateState({ numberOfPartsValue: value || defaultNumOfParts })}
          min={defaultNumOfParts}
          max={100}
          label="No. of parts"
          hint="Todo: No of parts hint"
        />
        <TradeNumberInput
          value={slippageValue}
          onUserInput={(value: number | null) => updateState({ slippageValue: value })}
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
        <DeadlineSelector deadline={deadlineState} items={orderDeadlines} setDeadline={(value) => updateState(value)} />

        <TradeTextBox label="Part every" hint="TODO: part every tooltip">
          <>{deadlinePartsDisplay(timeInterval)}</>
        </TradeTextBox>
      </styledEl.DeadlineRow>

      <PrimaryActionButton state={formState} context={formActions} />
    </>
  )
}
