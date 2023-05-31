import { transparentize } from 'polished'
import styled from 'styled-components/macro'

import PopoverMod, { Arrow as ArrowMod, PopoverContainer as PopoverContainerMod } from './PopoverMod'
import { PopoverProps } from './PopoverMod'

export * from './PopoverMod'

export interface PopoverContainerProps {
  show: boolean
  bgColor?: string
  color?: string
}

const PopoverContainer = styled(PopoverContainerMod)<PopoverContainerProps>`
  background: ${({ theme, bgColor }) => bgColor || theme.grey1};
  color: ${({ theme, color }) => color || theme.text1};
  box-shadow: ${({ theme }) => theme.boxShadow2};
  border: 1px solid ${({ theme }) => transparentize(0.95, theme.white)};
  border-radius: 12px;
  padding: 6px 3px;
  z-index: 10;
  font-size: 13px;

  > div div {
    font-size: inherit;
  }
`

const Arrow = styled(ArrowMod)<Omit<PopoverContainerProps, 'color' | 'show'>>`
  ::before {
    background: ${({ theme, bgColor }) => bgColor || theme.grey1};
  }
`

export default function Popover(props: Omit<PopoverProps, 'PopoverContainer' | 'Arrow'>) {
  return <PopoverMod {...props} Arrow={Arrow} PopoverContainer={PopoverContainer} />
}
