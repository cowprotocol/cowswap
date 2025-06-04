import { Dispatch, SetStateAction } from 'react'

import { FormControl, TextField } from '@mui/material'

export type DeadlineControlProps = {
  label: string
  deadlineState: [number | undefined, Dispatch<SetStateAction<number | undefined>>]
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function DeadlineControl({ label, deadlineState: [state, setState] }: DeadlineControlProps) {
  return (
    <FormControl>
      <TextField
        type="number"
        label={label}
        value={state}
        onChange={({ target: { value } }) => setState(value && !isNaN(+value) ? Math.max(1, Number(value)) : undefined)}
        size="small"
        inputProps={{ min: 1 }} // Set minimum value to 1
      />
    </FormControl>
  )
}
