import type { SxProps, Theme } from '@mui/material/styles'

/** Shared input font size for configurator text fields and select options. */
export const BASE_INPUT_FONT_SIZE = '1.4rem'

/** Matches {@link BASE_INPUT_FONT_SIZE} line (~23px) plus balanced vertical padding inside the outline. */
export const BASE_TEXT_INPUT_HEIGHT = 48

/** Outlined shrink label scale; legend notch text must match the scaled label size. */
const BASE_INPUT_SHRINK_LABEL_SCALE = 0.75

const BASE_INPUT_SHRINK_LABEL_FONT_SIZE = `calc(${BASE_INPUT_FONT_SIZE} * ${BASE_INPUT_SHRINK_LABEL_SCALE})`

/** MUI default horizontal inset for the outlined notch legend span. */
const OUTLINED_NOTCH_LEGEND_PADDING_X = '5px'

/** Label + notch styles; apply on FormControl (or TextField root) so InputLabel is in scope. */
export const baseTextInputFormControlSx: SxProps<Theme> = {
  width: '100%',
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
    maxWidth: 'calc(100% - 28px)',
  },
  '& .MuiOutlinedInput-notchedOutline legend > span': {
    display: 'inline-block',
    fontSize: BASE_INPUT_SHRINK_LABEL_FONT_SIZE,
    paddingLeft: OUTLINED_NOTCH_LEGEND_PADDING_X,
    paddingRight: OUTLINED_NOTCH_LEGEND_PADDING_X,
  },
}

export const baseTextInputOutlinedRootSx: SxProps<Theme> = {
  '& .MuiInputBase-root': {
    backgroundColor: 'transparent',
  },
  '& .MuiOutlinedInput-root:not(.MuiInputBase-multiline)': {
    height: BASE_TEXT_INPUT_HEIGHT,
    minHeight: BASE_TEXT_INPUT_HEIGHT,
    boxSizing: 'border-box',

    '& .MuiOutlinedInput-input': {
      fontSize: BASE_INPUT_FONT_SIZE,
      py: 0,
      px: '14px',
      height: '100%',
      boxSizing: 'content-box',
      backgroundColor: 'transparent',
    },
  },
}

export const baseTextInputSx: SxProps<Theme> = {
  ...baseTextInputFormControlSx,
  ...baseTextInputOutlinedRootSx,
}
