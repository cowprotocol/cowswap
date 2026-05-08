import type { Dispatch, ReactNode, SetStateAction } from 'react'

import type { WidgetHookEvents } from '@cowprotocol/widget-lib'

import { ADVANCED_BASE_URL_PRESETS_OPTIONS, ADVANCED_DEFAULT_BASE_URL } from './AdvancedSectionForm.constants'

import { jsonHelperText } from '../../../../utils/jsonFieldParsing'
import { JsonInput } from '../../../ui/controls/JsonInput/JsonInput.component'
import { PresetsButtons } from '../../../ui/controls/PresetsButtons/PresetsButtons.component'
import { WidgetHooksControl } from '../../../ui/controls/Select/WidgetHooksControl'
import { TextInput } from '../../../ui/controls/TextInput/TextInput.component'

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

  const widgetHooksState: [WidgetHookEvents[], Dispatch<SetStateAction<WidgetHookEvents[]>>] = [
    values.enabledWidgetHooks,
    (nextValue) => {
      const resolvedValue = typeof nextValue === 'function' ? nextValue(values.enabledWidgetHooks) : nextValue
      onChange('enabledWidgetHooks', resolvedValue)
    },
  ]

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
      <WidgetHooksControl state={widgetHooksState} />
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
