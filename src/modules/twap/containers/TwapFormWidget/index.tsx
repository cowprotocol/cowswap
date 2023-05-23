import * as styledEl from './styled'
import { TradeNumberInput } from '../../../trade/pure/TradeNumberInput'
import { PartsDisplay } from '../../pure/PartsDisplay'
import { DeadlineSelector } from '../../pure/DeadlineSelector'
import { useParseNumberOfParts } from '../../hooks/useParseNumberOfParts'
import { useState } from 'react'
import { useParseSlippage } from '../../hooks/useParseSlippage'
import { useDisplaySlippageValue } from '../../hooks/useDisplaySlippageValue'
import { useDisplaySlippageError } from '../../hooks/useDisplaySlippageError'
import { useAtomValue } from 'jotai'
import { twapNumOfPartsAtom } from '../../state/twapOrdersSettingsAtom'

export function TwapFormWidget() {
  // Number of parts
  const { numberOfPartsError, numberOfPartsValue } = useAtomValue(twapNumOfPartsAtom)
  const parseNumberOfParts = useParseNumberOfParts()

  // Slippage
  const [slippageInput, setSlippageInput] = useState('')
  const [slippageWarning, setSlippageWarning] = useState<string | null>(null)
  const [slippageError, setSlippageError] = useState<string | null>(null)

  const parseSlippageInput = useParseSlippage({
    setSlippageInput,
    setSlippageError,
    setSlippageWarning,
  })
  const displaySlippageValue = useDisplaySlippageValue(slippageInput)
  const displaySlippageError = useDisplaySlippageError(slippageWarning, slippageError)

  return (
    <>
      <styledEl.Row>
        <TradeNumberInput
          value={numberOfPartsValue}
          onUserInput={(v: string) => parseNumberOfParts(v)}
          error={numberOfPartsError ? { type: 'error', text: numberOfPartsError } : null}
          label="No. of parts"
          hint="Todo: No of parts hint"
        />
        <TradeNumberInput
          value={displaySlippageValue}
          onUserInput={(v: string) => parseSlippageInput(v)}
          error={displaySlippageError}
          label="Slippage"
          hint="Todo: Slippage hint"
          suffix="%"
        />
      </styledEl.Row>

      <PartsDisplay />
      <DeadlineSelector />
    </>
  )
}
