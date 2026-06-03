import type { ReactNode } from 'react'

import { ADVANCED_BASE_URL_PRESETS_OPTIONS, ADVANCED_DEFAULT_BASE_URL } from './AdvancedSectionForm.constants'

import { WIDGET_HOOKS_OPTIONS } from '../../../../configurator.constants'
import { useAsyncJsonError } from '../../../../hooks/useAsyncJsonError'
import { JsonInput } from '../../../ui/inputs/JsonInput/JsonInput.component'
import { PresetsButtons } from '../../../ui/inputs/PresetsButtons/PresetsButtons.component'
import { MultiSelectInput } from '../../../ui/inputs/Select/multi/MultiSelectInput.component'
import { TextInput } from '../../../ui/inputs/TextInput/TextInput.component'

import type { SidebarSectionFormProps } from '../section.types'

export function AdvancedSectionForm({ values, onChange }: SidebarSectionFormProps): ReactNode {
  const rawParamsJsonError = useAsyncJsonError(values.rawParamsJson)

  return (
    <>
      <PresetsButtons
        presets={ADVANCED_BASE_URL_PRESETS_OPTIONS}
        onPresetClick={(value) => {
          onChange('baseUrl', value === ADVANCED_DEFAULT_BASE_URL ? null : value)
        }}
      />

      <TextInput
        name="baseUrl"
        label="Widget App URL"
        value={values.baseUrl}
        onChange={onChange}
        placeholder={ADVANCED_DEFAULT_BASE_URL}
        InputLabelProps={{ shrink: true }}
      />

      <MultiSelectInput
        name="enabledWidgetHooks"
        label="Widget hooks"
        emptyLabel="No hooks selected"
        value={values.enabledWidgetHooks}
        options={WIDGET_HOOKS_OPTIONS}
        onChange={onChange}
      />

      <JsonInput
        label="Raw JSON params"
        name="rawParamsJson"
        value={values.rawParamsJson}
        onChange={onChange}
        error={rawParamsJsonError.error}
        helperText={rawParamsJsonError.helperText}
      />
    </>
  )
}
