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
  background: ${({ theme, bgColor }) => bgColor || theme.bg1};
  color: ${({ theme, color }) => color || theme.text1};
  box-shadow: 0 4px 16px 0 ${({ theme }) => transparentize(0.8, theme.shadow1)};
  border-radius: 12px;
  border: 0;
  padding: 6px 3px;
  z-index: 10;
  font-size: 13px;

  > div div {
    font-size: inherit;
  }
`

const Arrow = styled(ArrowMod)<Omit<PopoverContainerProps, 'color' | 'show'>>`
  ::before {
    background: ${({ theme, bgColor }) => bgColor || theme.bg1};
  }
`

export default function Popover(props: Omit<PopoverProps, 'PopoverContainer' | 'Arrow'>) {
  return <PopoverMod {...props} Arrow={Arrow} PopoverContainer={PopoverContainer} />
}
