import { Dispatch, ReactNode, SetStateAction } from 'react'

import { WidgetHookEvents } from '@cowprotocol/widget-lib'

import Checkbox from '@mui/material/Checkbox'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import OutlinedInput from '@mui/material/OutlinedInput'
import Select, { SelectChangeEvent } from '@mui/material/Select'

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

  const handleChange = (event: SelectChangeEvent<WidgetHookEvents[]>): void => {
    setWidgetHooks(event.target.value as WidgetHookEvents[])
  }

  return (
    <FormControl sx={{ width: '100%' }}>
      <InputLabel id={LABEL_ID} shrink>
        {LABEL}
      </InputLabel>
      <Select
        labelId={LABEL_ID}
        id="widget-hooks-select"
        multiple
        size="small"
        displayEmpty
        value={widgetHooks}
        onChange={handleChange}
        input={<OutlinedInput id="widget-hooks-select-outlined" label={LABEL} />}
        renderValue={(selected) => {
          const selectedHooks = selected as WidgetHookEvents[]

          if (selectedHooks.length === 0) {
            return EMPTY_VALUE_LABEL
          }

          return selectedHooks.join(', ')
        }}
      >
        {WIDGET_HOOKS.map((option) => (
          <MenuItem key={option} value={option}>
            <Checkbox checked={widgetHooks.includes(option)} />
            <ListItemText primary={option} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
