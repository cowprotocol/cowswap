import { Dispatch, SetStateAction } from 'react'

import { TradeType } from '@cowprotocol/widget-lib'

import Checkbox from '@mui/material/Checkbox'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import OutlinedInput from '@mui/material/OutlinedInput'
import Select, { SelectChangeEvent } from '@mui/material/Select'

const LABEL = 'Trade types'
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function TradeModesControl({ state }: { state: [TradeType[], Dispatch<SetStateAction<TradeType[]>>] }) {
  const [tradeModes, setTradeModes] = state
  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleTradeModeChange = (event: SelectChangeEvent<TradeType[]>) => {
    if (!event.target.value.length) return

    setTradeModes(event.target.value as TradeType[])
  }

  return (
    <FormControl sx={{ width: '100%' }}>
      <InputLabel>{LABEL}</InputLabel>
      <Select
        id="trade-mode-select"
        multiple
        size="small"
        value={tradeModes}
        onChange={handleTradeModeChange}
        input={<OutlinedInput id="trade-mode-select-outlined" label={LABEL} />}
        renderValue={(selected) => selected.join(', ')}
      >
        {Object.values(TradeType).map((option) => (
          <MenuItem key={option} value={option}>
            <Checkbox checked={tradeModes.indexOf(option) > -1} />
            <ListItemText primary={option} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
