import { Dispatch, ReactNode, SetStateAction } from 'react'

import { WidgetHookEvents } from '@cowprotocol/widget-lib'

import Checkbox from '@mui/material/Checkbox'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import OutlinedInput from '@mui/material/OutlinedInput'
import Select, { SelectChangeEvent } from '@mui/material/Select'

import { WIDGET_HOOKS } from '../consts'

const LABEL = 'Widget hooks'

export function WidgetHooksControl({
  state,
}: {
  state: [WidgetHookEvents[], Dispatch<SetStateAction<WidgetHookEvents[]>>]
}): ReactNode {
  const [widgetHooks, setWidgetHooks] = state

  const handleChange = (event: SelectChangeEvent<WidgetHookEvents[]>): void => {
    if (!event.target.value.length) return

    setWidgetHooks(event.target.value as WidgetHookEvents[])
  }

  return (
    <FormControl sx={{ width: '100%' }}>
      <InputLabel>{LABEL}</InputLabel>
      <Select
        id="widget-hooks-select"
        multiple
        size="small"
        value={widgetHooks}
        onChange={handleChange}
        input={<OutlinedInput id="widget-hooks-select-outlined" label={LABEL} />}
        renderValue={(selected) => selected.join(', ')}
      >
        {WIDGET_HOOKS.map((option) => (
          <MenuItem key={option} value={option}>
            <Checkbox checked={widgetHooks.indexOf(option) > -1} />
            <ListItemText primary={option} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
