import styled from 'styled-components/macro'
import { Text } from 'rebass'
import { ThemedText as ThemedTextUni, TextProps as TextPropsUni } from '@src/theme'
import { Colors } from './styled'

export enum ButtonSize {
  SMALL,
  DEFAULT,
  BIG,
}

export enum Z_INDEX {
  deprecated_zero = 0,
  deprecated_content = 1,
  dropdown = 1000,
  sticky = 1020,
  fixed = 1030,
  modalBackdrop = 1040,
  offcanvas = 1050,
  modal = 1060,
  popover = 1070,
  tooltip = 1080,
}

type TextProps = TextPropsUni & { override?: boolean }

export const TextWrapper = styled(Text)<{ color: keyof Colors; override?: boolean }>`
  display: contents;
  color: ${({ color, theme, override }) => {
    const colour = (theme as any)[color]
    if (colour && override) {
      return colour + '!important'
    } else {
      return colour
    }
  }};
`

/**
 * Preset styles of the Rebass Text component
 * MOD of UNI's in @src/theme/index.ts
 */
export const ThemedText = {
  ...ThemedTextUni,
  Warn(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'warning'} {...props} />
  },
}

// Cow theme
export { default } from './cowSwapTheme'
export * from './cowSwapTheme'
export * from './components'

// GP theme
// export { default } from './baseTheme'
// export * from './baseTheme'
