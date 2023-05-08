import { WidgetField, WidgetLabel, WidgetContent } from '@cow/modules/advancedOrders/pure/WidgetField'
import { Trans } from '@lingui/macro'
import { useAtomValue } from 'jotai'
import QuestionHelper from 'components/QuestionHelper'
import { advancedOrdersSettingsAtom } from '@cow/modules/advancedOrders/state/advancedOrdersSettingsAtom'
import { useParseNumberOfParts } from '@cow/modules/advancedOrders/hooks/useParseNumberOfParts'
import { NumericalInput } from '@cow/modules/advancedOrders/pure/NumericalInput'
import { MAX_PARTS_NUMBER, MIN_PARTS_NUMBER } from '@src/constants'
import * as styledEl from './styled'

export function NumberOfParts() {
  const { numberOfParts, numberOfPartsError } = useAtomValue(advancedOrdersSettingsAtom)
  const parseNumberOfParts = useParseNumberOfParts()

  const tooHigh = numberOfParts > MAX_PARTS_NUMBER

  return (
    <WidgetField>
      <WidgetLabel>
        <Trans>No. of parts</Trans>
        <QuestionHelper text={<Trans>TODO: Add tooltip "No. of parts" text here</Trans>} />
      </WidgetLabel>

      <WidgetContent>
        <NumericalInput
          value={numberOfParts}
          color={numberOfPartsError ? 'red' : ''}
          onUserInput={(value) => parseNumberOfParts(value)}
        />
      </WidgetContent>
      {numberOfPartsError || tooHigh ? (
        <styledEl.ErrorRow error={!!numberOfPartsError}>
          <Trans>
            Enter number of parts between {MIN_PARTS_NUMBER} and {MAX_PARTS_NUMBER}
          </Trans>
        </styledEl.ErrorRow>
      ) : null}
    </WidgetField>
  )
}
