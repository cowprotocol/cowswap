import { ReactNode } from 'react'

import { TextField, TextFieldProps } from '@mui/material'

import { baseTextInputSx, BASE_INPUT_FONT_SIZE, BASE_TEXT_INPUT_HEIGHT } from './BaseTextInput.styles'

export { BASE_INPUT_FONT_SIZE, BASE_TEXT_INPUT_HEIGHT }

export interface BaseTextInputProps extends Omit<TextFieldProps, 'fullWidth' | 'margin' | 'size'> {
  name: string
  label: string
}

export function BaseTextInput(props: BaseTextInputProps): ReactNode {
  const resolvedSx = Array.isArray(props.sx) ? props.sx : props.sx ? [props.sx] : []

  return <TextField {...props} sx={[baseTextInputSx, ...resolvedSx]} fullWidth margin="dense" size="small" />
}
