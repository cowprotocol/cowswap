import { WidgetField, WidgetLabel, WidgetContent } from '@cow/modules/advancedOrders/pure/WidgetField'
import { Trans } from '@lingui/macro'
import QuestionHelper from 'components/QuestionHelper'
import { useAtomValue, useSetAtom } from 'jotai'
import {
  advancedOrdersSettingsAtom,
  updateAdvancedOrdersSettingsAtom,
} from '@cow/modules/advancedOrders/state/advancedOrdersSettingsAtom'
import { NumericalInput } from '@cow/modules/advancedOrders/pure/NumericalInput'

export function NumberOfParts() {
  const { numberOfParts } = useAtomValue(advancedOrdersSettingsAtom)

  const updateSettingsState = useSetAtom(updateAdvancedOrdersSettingsAtom)

  const onUserInput = (value: string) => {
    updateSettingsState({ numberOfParts: Number(value) })
  }

  return (
    <WidgetField>
      <WidgetLabel>
        <Trans>No. of parts</Trans>
        <QuestionHelper text={<Trans>TODO: Add tooltip "No. of parts" text here</Trans>} />
      </WidgetLabel>

      <WidgetContent>
        <NumericalInput value={numberOfParts} onUserInput={onUserInput} />
      </WidgetContent>
    </WidgetField>
  )
}
