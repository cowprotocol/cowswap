import type { ReactNode } from 'react'
import { useCallback } from 'react'

import type { WidgetHookEvents } from '@cowprotocol/widget-lib'

import { ADVANCED_BASE_URL_PRESETS_OPTIONS, ADVANCED_DEFAULT_BASE_URL } from './AdvancedSectionForm.constants'

import { WIDGET_HOOKS_OPTIONS } from '../../../../configurator.constants'
import { jsonHelperText } from '../../../../utils/jsonFieldParsing'
import { JsonInput } from '../../../ui/inputs/JsonInput/JsonInput.component'
import { PresetsButtons } from '../../../ui/inputs/PresetsButtons/PresetsButtons.component'
import { SelectInput, SelectInputValue } from '../../../ui/inputs/Select/SelectInput'
import { TextInput } from '../../../ui/inputs/TextInput/TextInput.component'

import type { ConfiguratorFormChangeHandler, ConfiguratorFormValues } from '../section.types'

interface AdvancedSectionFormProps {
  values: ConfiguratorFormValues
  onChange: ConfiguratorFormChangeHandler
}

function hasRawParamsError(rawValue: string | null): boolean {
  if (!rawValue?.trim()) return false

  try {
    JSON.parse(rawValue)
    return false
  } catch {
    return true
  }
}

export function AdvancedSectionForm({ values, onChange }: AdvancedSectionFormProps): ReactNode {
  const rawParamsJsonError = hasRawParamsError(values.rawParamsJson)

  const renderWidgetHooksValue = useCallback((value: SelectInputValue<WidgetHookEvents>): ReactNode => {
    const selectedHooks = Array.isArray(value) ? value : []

    if (selectedHooks.length === 0) {
      return 'No hooks selected'
    }

    return selectedHooks.join(', ')
  }, [])

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
        helperText={`Optional. Sets baseUrl (overrides Raw JSON). Default preview URL: ${ADVANCED_DEFAULT_BASE_URL}`}
      />

      <SelectInput
        name="enabledWidgetHooks"
        label="Widget hooks"
        multiple
        displayEmpty
        value={values.enabledWidgetHooks}
        options={WIDGET_HOOKS_OPTIONS}
        onChange={onChange}
        renderValue={renderWidgetHooksValue}
      />

      <JsonInput
        label="Raw JSON params"
        name="rawParamsJson"
        value={values.rawParamsJson}
        onChange={onChange}
        error={rawParamsJsonError}
        helperText={jsonHelperText(rawParamsJsonError)}
      />
    </>
  )
}
