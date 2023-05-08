import { Trans } from '@lingui/macro'
import { useMemo, useState } from 'react'

import { WidgetField, WidgetLabel, WidgetContent } from '@cow/modules/advancedOrders/pure/WidgetField'
import { SlippageError } from '@cow/modules/advancedOrders/state/advancedOrdersSettingsAtom'
import { useParseSlippage } from '@cow/modules/advancedOrders/hooks/useParseSlippage'
import { useSlippage } from '@cow/modules/advancedOrders/hooks/useSlippage'
import { NumericalInput } from '@cow/modules/advancedOrders/pure/NumericalInput'

import QuestionHelper from 'components/QuestionHelper'
import * as styledEl from './styled'

import { HIGH_SLIPPAGE_BPS, LOW_SLIPPAGE_BPS, MAX_SLIPPAGE_BPS } from '@src/constants'
import { Percent } from '@uniswap/sdk-core'

export function Slippage() {
  const [slippageInput, setSlippageInput] = useState('')
  const [slippageError, setSlippageError] = useState<SlippageError | false>(false)

  const parseSlippageInput = useParseSlippage(setSlippageInput, setSlippageError)

  const slippage = useSlippage()

  const displaySlippageValue = useMemo(() => {
    if (slippageInput.length > 0) {
      return slippageInput
    } else if (slippage === 'auto') {
      return ''
    } else {
      return slippage.toFixed(2)
    }
  }, [slippageInput, slippage])

  const tooLow = slippage !== 'auto' && slippage.lessThan(new Percent(LOW_SLIPPAGE_BPS, 10_000))
  const tooHigh = slippage !== 'auto' && slippage.greaterThan(new Percent(HIGH_SLIPPAGE_BPS, 10_000))

  return (
    <WidgetField>
      <WidgetLabel>
        <Trans>Slippage</Trans>
        <QuestionHelper text={<Trans>TODO: Add tooltip "Slippage" text here</Trans>} />
      </WidgetLabel>

      <WidgetContent>
        <NumericalInput
          value={displaySlippageValue}
          color={slippageError ? 'red' : ''}
          onUserInput={(value) => parseSlippageInput(value)}
        />
        <styledEl.PercentSign>%</styledEl.PercentSign>
      </WidgetContent>

      {slippageError || tooLow || tooHigh ? (
        <styledEl.ErrorRow error={!!slippageError}>
          {slippageError ? (
            <Trans>Enter slippage percentage between {MAX_SLIPPAGE_BPS / 100}%</Trans>
          ) : tooLow ? (
            <Trans>Your transaction may expire</Trans>
          ) : (
            <Trans>High slippage amount selected</Trans>
          )}
        </styledEl.ErrorRow>
      ) : null}
    </WidgetField>
  )
}
