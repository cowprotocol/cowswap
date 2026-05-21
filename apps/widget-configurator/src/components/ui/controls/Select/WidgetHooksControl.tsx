import { Dispatch, ReactNode, SetStateAction } from 'react'

import { WidgetHookEvents } from '@cowprotocol/widget-lib'

import { SelectInput } from './SelectInput'

import { WIDGET_HOOKS } from '../../../../configurator.constants'

const LABEL = 'Widget hooks'
const EMPTY_VALUE_LABEL = 'No hooks selected'
const LABEL_ID = 'widget-hooks-select-label'

export function WidgetHooksControl({
  state,
}: {
  state: [WidgetHookEvents[], Dispatch<SetStateAction<WidgetHookEvents[]>>]
}): ReactNode {
  const [widgetHooks, setWidgetHooks] = state

  const handleChange = (_: string, value: WidgetHookEvents[] | '' | WidgetHookEvents): void => {
    if (!Array.isArray(value)) return
    setWidgetHooks(value)
  }

  return (
    <SelectInput
      labelId={LABEL_ID}
      id="widget-hooks-select"
      name="enabledWidgetHooks"
      label={LABEL}
      multiple
      displayEmpty
      value={widgetHooks}
      options={WIDGET_HOOKS.map((option) => ({ label: option, value: option }))}
      onChange={handleChange}
      renderValue={(selected) => {
        const selectedHooks = Array.isArray(selected) ? selected : []

        if (selectedHooks.length === 0) {
          return EMPTY_VALUE_LABEL
        }

        return selectedHooks.join(', ')
      }}
    />
  )
}
