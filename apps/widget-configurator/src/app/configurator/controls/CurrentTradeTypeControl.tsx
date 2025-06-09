import { Dispatch, SetStateAction } from 'react'

import type { TradeType } from '@cowprotocol/widget-lib'

import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'

import { TRADE_MODES } from '../consts'

const LABEL = 'Current trade type'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function CurrentTradeTypeControl({ state }: { state: [TradeType, Dispatch<SetStateAction<TradeType>>] }) {
  const [tradeType, setTradeType] = state

  return (
    <FormControl sx={{ width: '100%' }}>
      <InputLabel>{LABEL}</InputLabel>
      <Select
        id="select-trade-type"
        value={tradeType}
        onChange={(event) => setTradeType(event.target.value as TradeType)}
        autoWidth
        label={LABEL}
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
