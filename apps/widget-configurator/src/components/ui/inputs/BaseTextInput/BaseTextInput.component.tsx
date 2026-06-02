import { ReactNode } from 'react'

import { TextField, TextFieldProps } from '@mui/material'

export const BASE_TEXT_INPUT_HEIGHT = 42

export interface BaseTextInputProps extends Omit<TextFieldProps, 'fullWidth' | 'margin' | 'size'> {
  name: string
  label: string
}

export function BaseTextInput(props: BaseTextInputProps): ReactNode {
  const resolvedSx = Array.isArray(props.sx) ? props.sx : props.sx ? [props.sx] : []

  return (
    <TextField
      {...props}
      sx={[
        ...resolvedSx,
        {
          '& .MuiInputBase-root': {
            backgroundColor: 'red',
          },
          '& .MuiOutlinedInput-root:not(.MuiInputBase-multiline)': {
            height: BASE_TEXT_INPUT_HEIGHT,
            minHeight: BASE_TEXT_INPUT_HEIGHT,
          },
          '& .MuiOutlinedInput-notchedOutline legend > span': {
            display: 'inline-block',
            paddingLeft: 0,
            paddingRight: 0,
          },
        },
      ]}
      fullWidth
      margin="dense"
      size="small"
    />
  )
}
