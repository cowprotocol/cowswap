import React from 'react'
import PopoverMod, { Arrow as ArrowMod, PopoverContainer as PopoverContainerMod } from './PopoverMod'
import styled from 'styled-components/macro'
import { PopoverProps } from './PopoverMod'
import { transparentize } from 'polished'

export * from './PopoverMod'

export interface PopoverContainerProps {
  show: boolean
  bgColor?: string
  color?: string
}

const PopoverContainer = styled(PopoverContainerMod)<PopoverContainerProps>`
  background: ${({ theme }) => theme.bg4};
  color: ${({ theme, color }) => color || theme.text1};
  box-shadow: 0 4px 16px 0 ${({ theme }) => transparentize(0.8, theme.shadow1)};
  border-radius: 12px;
  border: 0;
  padding: 6px 3px;
`

const Arrow = styled(ArrowMod)<Omit<PopoverContainerProps, 'color' | 'show'>>`
  ::before {
    background: ${({ theme }) => theme.bg4};
  }
`

export default function Popover(props: Omit<PopoverProps, 'PopoverContainer' | 'Arrow'>) {
  return <PopoverMod {...props} Arrow={Arrow} PopoverContainer={PopoverContainer} />
}
