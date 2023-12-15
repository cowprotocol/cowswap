import { UI } from '../../enum'
import styled from 'styled-components'

import PopoverMod, { Arrow as ArrowMod, PopoverContainer as PopoverContainerMod } from './PopoverMod'
import { PopoverProps } from './PopoverMod'

export * from './PopoverMod'

export interface PopoverContainerProps {
  show: boolean
  bgColor?: string
  color?: string
}

const PopoverContainer = styled(PopoverContainerMod)<PopoverContainerProps>`
  background: ${({ bgColor }) => bgColor || `var(${UI.COLOR_PAPER_DARKER})`};
  color: ${({ color }) => color || `var(${UI.COLOR_TEXT_PAPER})`};
  box-shadow: var(${UI.BOX_SHADOW});
  border: 1px solid ${({ bgColor }) => bgColor || `var(${UI.COLOR_PAPER_DARKEST})`};
  border-radius: 12px;
  padding: 6px 3px;
  z-index: 10;
  font-size: 13px;
  backdrop-filter: blur(20px);

  > div div {
    font-size: inherit;
  }
`

const Arrow = styled(ArrowMod)<Omit<PopoverContainerProps, 'color' | 'show'>>`
  ::before {
    background: ${({ bgColor }) => bgColor || `var(${UI.COLOR_PAPER_DARKER})`};
    border: 1px solid ${({ bgColor }) => bgColor || `var(${UI.COLOR_PAPER_DARKEST})`};
  }
`

export default function Popover(props: Omit<PopoverProps, 'PopoverContainer' | 'Arrow'>) {
  return <PopoverMod {...props} Arrow={Arrow} PopoverContainer={PopoverContainer} />
}
