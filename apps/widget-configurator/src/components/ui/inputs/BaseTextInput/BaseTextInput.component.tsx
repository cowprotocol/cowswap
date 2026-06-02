import { ReactNode } from 'react'

import { TextField, TextFieldProps } from '@mui/material'

/** Matches 1.4rem input line (~23px) plus balanced vertical padding inside the outline. */
export const BASE_TEXT_INPUT_HEIGHT = 48

// const INPUT_LINE_HEIGHT_PX = 23
// const INPUT_VERTICAL_PADDING_PX = (BASE_TEXT_INPUT_HEIGHT - INPUT_LINE_HEIGHT_PX) / 2

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
            backgroundColor: 'red', // TODO: Transparent, for all
          },
          '& .MuiOutlinedInput-root:not(.MuiInputBase-multiline)': {
            height: BASE_TEXT_INPUT_HEIGHT,
            minHeight: BASE_TEXT_INPUT_HEIGHT,
            boxSizing: 'border-box',

            '& .MuiOutlinedInput-input': {
              py: 0,
              px: '14px',
              height: '100%',
              boxSizing: 'content-box',
              // backgroundColor: 'background.paper',
              backgroundColor: 'transparent',
            },
          },
          '& .MuiInputLabel-root:not(.MuiInputLabel-shrink)': {
            height: BASE_TEXT_INPUT_HEIGHT,
            display: 'flex',
            alignItems: 'center',
            transform: 'translate(14px, 0) scale(1)',
            maxWidth: 'calc(100% - 28px)',
          },
          '& .MuiInputLabel-root.MuiInputLabel-shrink': {
            height: 'auto',
            display: 'block',
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
