import { Dispatch, SetStateAction } from 'react'

import { FormControl, TextField } from '@mui/material'

export type DeadlineControlProps = {
  label: string
  deadlineState: [number | undefined, Dispatch<SetStateAction<number | undefined>>]
}

export function DeadlineControl({ label, deadlineState: [state, setState] }: DeadlineControlProps) {
  return (
    <FormControl>
      <TextField
        type="number"
        label={label}
        value={state}
        onChange={(e) => setState(Math.max(0, Number(e.target.value)))}
        size="small"
        inputProps={{ min: 0 }} // Set minimum value to 0
      />
    </FormControl>
  )
}
