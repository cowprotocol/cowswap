import * as styledEl from './styled'
import { TradeNumberInput } from '../../../trade/pure/TradeNumberInput'
import { PartsDisplay } from '../../pure/PartsDisplay'
import { DeadlineSelector } from '../../pure/DeadlineSelector'
import { useAtomValue } from 'jotai'
import { twapOrdersSettingsAtom, updateTwapOrdersSettingsAtom } from '../../state/twapOrdersSettingsAtom'
import { useUpdateAtom } from 'jotai/utils'
import { partsStateAtom } from '../../state/partsStateAtom'

export function TwapFormWidget() {
  // Number of parts
  const { numberOfPartsValue, slippageValue } = useAtomValue(twapOrdersSettingsAtom)
  const partsState = useAtomValue(partsStateAtom)
  const updateState = useUpdateAtom(updateTwapOrdersSettingsAtom)

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
          max={50}
          label="Slippage"
          hint="Todo: Slippage hint"
          suffix="%"
        />
      </styledEl.Row>

      <PartsDisplay partsState={partsState} />
      <DeadlineSelector />
    </>
  )
}
