import * as styledEl from './styled'
import { TradeNumberInput } from 'modules/trade/pure/TradeNumberInput'
import { TradeTextBox } from 'modules/trade/pure/TradeTextBox'
import { AmountParts } from '../../pure/AmountParts'
import { useAtomValue } from 'jotai'
import { twapOrdersSettingsAtom, updateTwapOrdersSettingsAtom } from '../../state/twapOrdersSettingsAtom'
import { useUpdateAtom } from 'jotai/utils'
import { partsStateAtom } from '../../state/partsStateAtom'
import { DeadlineSelector } from '../../pure/DeadlineSelector'
import { useMemo } from 'react'
import { displayTime } from 'utils/displayTime'
import { DEFAULT_TWAP_SLIPPAGE, orderDeadlines } from '../../const'
import { twapTimeIntervalAtom } from '../../state/twapOrderAtom'
import { PrimaryActionButton } from '../../pure/PrimaryActionButton'
import { useTwapFormActions } from '../../hooks/useTwapFormActions'
import { useTwapFormState } from '../../hooks/useTwapFormState'

export function TwapFormWidget() {
  const { numberOfPartsValue, slippageValue, deadline, customDeadline, isCustomDeadline } =
    useAtomValue(twapOrdersSettingsAtom)
  const partsState = useAtomValue(partsStateAtom)
  const timeInterval = useAtomValue(twapTimeIntervalAtom)
  const updateState = useUpdateAtom(updateTwapOrdersSettingsAtom)

  const formActions = useTwapFormActions()
  const formState = useTwapFormState()

  const partsTime = useMemo(() => {
    return displayTime((timeInterval * 1000) / numberOfPartsValue)
  }, [numberOfPartsValue, timeInterval])

  return (
    <>
      <styledEl.Row>
        <TradeNumberInput
          value={numberOfPartsValue}
          onUserInput={(value: number | null) => updateState({ numberOfPartsValue: value || 1 })}
          min={1}
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
        <DeadlineSelector
          deadline={{
            deadline,
            customDeadline,
            isCustomDeadline,
          }}
          items={orderDeadlines}
          setDeadline={(value) => updateState(value)}
        />

        <TradeTextBox label="Part every" hint="TODO: part every tooltip">
          <>{partsTime}</>
        </TradeTextBox>
      </styledEl.DeadlineRow>

      <PrimaryActionButton state={formState} context={formActions} />
    </>
  )
}
