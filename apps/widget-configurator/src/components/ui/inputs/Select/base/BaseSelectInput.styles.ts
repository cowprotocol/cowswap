import { configuratorSurfacePaperProps } from '../../../surface/surface.styles'
import { BASE_INPUT_FONT_SIZE, BASE_TEXT_INPUT_HEIGHT } from '../../BaseTextInput/BaseTextInput.component'

import type { SelectProps } from '@mui/material/Select'
import type { CSSObject, SxProps, Theme } from '@mui/material/styles'

export const BASE_SELECT_OPTION_HEIGHT = 40

const SELECT_OPTION_CHECK_PLACEHOLDER_WIDTH = 18

const getSelectMenuItemInteractionSx = (theme: Theme): CSSObject => ({
  backgroundColor: 'transparent',

  '&.Mui-selected': {
    backgroundColor: 'transparent',
  },

  '&:hover, &.Mui-focusVisible, &.Mui-selected:hover, &.Mui-selected.Mui-focusVisible': {
    backgroundColor: theme.palette.action.hover,
  },
})

/** Overrides MUI MenuItem `min-height: auto` from the `sm` breakpoint upward. */
export const selectMenuItemSx: SxProps<Theme> = (theme) => ({
  minHeight: BASE_SELECT_OPTION_HEIGHT,
  fontSize: BASE_INPUT_FONT_SIZE,
  py: 1,
  px: 2,
  display: 'flex',
  alignItems: 'flex-start',
  gap: 2,
  whiteSpace: 'normal',

  ...getSelectMenuItemInteractionSx(theme),

  [theme.breakpoints.up('sm')]: {
    minHeight: BASE_SELECT_OPTION_HEIGHT,
  },
})

export const selectMenuPaperSx: SxProps<Theme> = (theme) => ({
  '& .MuiMenuItem-root': {
    minHeight: BASE_SELECT_OPTION_HEIGHT,

    ...getSelectMenuItemInteractionSx(theme),

    [theme.breakpoints.up('sm')]: {
      minHeight: BASE_SELECT_OPTION_HEIGHT,
    },
  },
})

export const NO_MENU_ANIMATION_PROPS: SelectProps['MenuProps'] = {
  transitionDuration: 0,
  TransitionProps: {
    timeout: 0,
  },
  PaperProps: configuratorSurfacePaperProps,
}

export const selectOptionRowSx = {
  display: 'flex',
  alignItems: 'flex-start',
  width: '100%',
} as const satisfies SxProps<Theme>

export const selectOptionLabelSx = {
  minWidth: 0,
  flex: '1 1 auto',
} as const satisfies SxProps<Theme>

export const selectOptionLabelContentSx = {
  m: 0,
  fontSize: BASE_INPUT_FONT_SIZE,
  whiteSpace: 'initial',
  wordBreak: 'break-word',
} as const satisfies SxProps<Theme>

export const selectOptionCheckboxSx = {
  marginLeft: 'auto',
  padding: 0,
  transform: 'translateX(8px)',
} as const satisfies SxProps<Theme>

export const selectOptionCheckIconSx = {
  marginLeft: 'auto',
} as const satisfies SxProps<Theme>

export const selectOptionCheckPlaceholderSx = {
  width: SELECT_OPTION_CHECK_PLACEHOLDER_WIDTH,
  marginLeft: 'auto',
} as const satisfies SxProps<Theme>

export const selectMultipleSelectedValueSx = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 0.5,
  maxWidth: '100%',
} as const satisfies SxProps<Theme>

export const multiSelectValueItemSx = {
  minWidth: 0,
  maxWidth: '100%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} as const satisfies SxProps<Theme>

export function getSelectInputFormControlSx(fullWidth: boolean): SxProps<Theme> {
  return { width: fullWidth ? '100%' : undefined }
}

export function getSelectInputSx(multilineSelectedValue: boolean): SxProps<Theme> {
  return {
    '& .MuiInputBase-root, &.MuiInputBase-root': {
      backgroundColor: 'transparent',
    },
    '&.MuiOutlinedInput-root:not(.MuiInputBase-multiline)': multilineSelectedValue
      ? {
          minHeight: BASE_TEXT_INPUT_HEIGHT,
        }
      : {
          height: BASE_TEXT_INPUT_HEIGHT,
          minHeight: BASE_TEXT_INPUT_HEIGHT,
        },
    '& .MuiOutlinedInput-notchedOutline legend > span': {
      display: 'inline-block',
      paddingLeft: 0,
      paddingRight: 0,
    },
    ...(multilineSelectedValue
      ? {
          '& .MuiSelect-select': {
            display: 'flex',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            whiteSpace: 'normal',
            rowGap: 4,
            columnGap: 4,
            maxWidth: '100%',
            minWidth: 0,
            boxSizing: 'border-box',
          },
          '& .MuiSelect-select > .MuiBox-root': {
            maxWidth: '100%',
          },
        }
      : undefined),
  }
}
