import React from 'react'
import PopoverMod, { Arrow as ArrowMod, PopoverContainer as PopoverContainerMod } from './PopoverMod'
import styled from 'styled-components/macro'
import { PopoverProps } from './PopoverMod'

export * from './PopoverMod'

export interface PopoverContainerProps {
  show: boolean
  bgColor?: string
  color?: string
}

const PopoverContainer = styled(PopoverContainerMod)<PopoverContainerProps>`
  background: ${({ theme, bgColor }) => bgColor || theme.bg2};
  color: ${({ theme, color }) => color || theme.text2};
`

const Arrow = styled(ArrowMod)<Omit<PopoverContainerProps, 'color' | 'show'>>`
  ::before {
    background: ${({ theme, bgColor }) => bgColor || theme.bg2};
  }
`

export default function Popover(props: Omit<PopoverProps, 'PopoverContainer' | 'Arrow'>) {
  return <PopoverMod {...props} Arrow={Arrow} PopoverContainer={PopoverContainer} />
}
