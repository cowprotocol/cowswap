import React from 'react'

import { Colors } from '@cowprotocol/ui'

import { Text, TextProps as TextPropsOriginal } from 'rebass'
import styled from 'styled-components/macro'

export type TextProps = Omit<TextPropsOriginal, 'css'> & { override?: boolean }

// Migrating to a standard z-index system https://getbootstrap.com/docs/5.0/layout/z-index/
// Please avoid using deprecated numbers
export enum Z_INDEX {
  deprecated_zero = 0,
  deprecated_content = 1,
  dropdown = 1000,
  sticky = 1020,
  fixed = 1030,
  modal = 1060,
  popover = 1070,
  tooltip = 1080,
}

export const WIDGET_MAX_WIDTH = {
  swap: '470px',
  limit: '1350px',
  content: '680px',
  tokenSelect: '590px',
}

export const TextWrapper = styled(Text)<{ color: keyof Colors; override?: boolean }>`
  color: ${({ color, theme, override }) => {
    // TODO: Replace any with proper type definitions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
 */
export const ThemedText = {
  Main(props: TextProps) {
    return <TextWrapper fontWeight={500} {...props} />
  },
  Link(props: TextProps) {
    return <TextWrapper fontWeight={500} {...props} />
  },
  Label(props: TextProps) {
    return <TextWrapper fontWeight={600} {...props} />
  },
  Small(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={11} {...props} />
  },
  Black(props: TextProps) {
    return <TextWrapper fontWeight={500} {...props} />
  },
  Blue(props: TextProps) {
    return <TextWrapper fontWeight={500} {...props} />
  },
  Error({ ...props }: { error: boolean } & TextProps) {
    return <TextWrapper fontWeight={500} {...props} />
  },
  Body(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={16} {...props} />
  },
  MediumHeader(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={20} {...props} />
  },
  LargeHeader(props: TextProps) {
    return <TextWrapper fontWeight={600} fontSize={24} {...props} />
  },
  DarkGray(props: TextProps) {
    return <TextWrapper fontWeight={500} {...props} />
  },
}
