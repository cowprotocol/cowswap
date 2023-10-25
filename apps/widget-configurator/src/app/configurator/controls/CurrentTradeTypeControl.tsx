import { Dispatch, SetStateAction } from 'react'

import { TradeType } from '@cowprotocol/widget-lib'

import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'

import { TRADE_MODES } from '../consts'

export function CurrentTradeTypeControl({ state }: { state: [TradeType, Dispatch<SetStateAction<TradeType>>] }) {
  const [tradeType, setTradeType] = state

  return (
    <FormControl sx={{ width: '100%' }}>
      <InputLabel id="select-trade-type">Current trade type</InputLabel>
      <Select
        labelId="select-trade-type-label"
        id="select-trade-type"
        value={tradeType}
        onChange={(event) => setTradeType(event.target.value as TradeType)}
        autoWidth
        label="Trade type"
        size="small"
      >
        {TRADE_MODES.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
