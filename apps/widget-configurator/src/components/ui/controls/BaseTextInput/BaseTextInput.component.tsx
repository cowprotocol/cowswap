import { ReactNode } from 'react'

import { TextField, TextFieldProps } from '@mui/material'

export interface BaseTextInputProps extends Omit<TextFieldProps, 'fullWidth' | 'margin' | 'size'> {
  name: string
  label: string
}

export function BaseTextInput(props: BaseTextInputProps): ReactNode {
  return (
    <TextField
      {...props}
      // sx={[
      //   props.sx,
      //   {
      //     '& .MuiInputBase-root': {
      //       backgroundColor: 'red',
      //     },
      //   },
      // ]}
      fullWidth
      margin="dense"
      size="medium"
    />
  )
}
