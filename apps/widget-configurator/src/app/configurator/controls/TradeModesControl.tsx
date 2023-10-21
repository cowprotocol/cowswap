import { useState } from 'react'

import Checkbox from '@mui/material/Checkbox'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import OutlinedInput from '@mui/material/OutlinedInput'
import Select, { SelectChangeEvent } from '@mui/material/Select'

enum TradeMode {
  Swap = 'Swap',
  Limit = 'Limit',
  TWAP = 'TWAP',
}

export function TradeModesControl() {
  const [tradeModes, setTradeModes] = useState<TradeMode[]>([TradeMode.Swap, TradeMode.Limit, TradeMode.TWAP])
  const handleTradeModeChange = (event: SelectChangeEvent<TradeMode[]>) => {
    setTradeModes(event.target.value as TradeMode[])
  }

  return (
    <FormControl sx={{ width: '100%' }}>
      <InputLabel id="trade-mode-label">Trade Modes</InputLabel>
      <Select
        labelId="trade-mode-label"
        id="trade-mode-select"
        multiple
        size="small"
        value={tradeModes}
        onChange={handleTradeModeChange}
        input={<OutlinedInput id="trade-mode-select-outlined" label="Available trade modes" />}
        renderValue={(selected) => selected.join(', ')}
      >
        {Object.values(TradeMode).map((option) => (
          <MenuItem key={option} value={option}>
            <Checkbox checked={tradeModes.indexOf(option) > -1} />
            <ListItemText primary={option} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
