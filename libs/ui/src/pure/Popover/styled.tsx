import styled from 'styled-components/macro'

import { UI } from '../../enum'

import type { PopoverContainerProps } from './index'

export const ReferenceElement = styled.div`
  display: inline-block;
`

export const PopoverContainer = styled.div<PopoverContainerProps>`
  visibility: ${(props) => (props.show ? 'visible' : 'hidden')};
  opacity: ${(props) => (props.show ? 1 : 0)};
  transition: visibility 150ms linear, opacity 150ms linear;

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

export const Arrow = styled.div<Omit<PopoverContainerProps, 'color' | 'show'>>`
  width: 8px;
  height: 8px;
  z-index: 9998;
  color: inherit;

  ::before {
    position: absolute;
    width: 8px;
    height: 8px;
    z-index: 9998;
    content: '';
    transform: rotate(45deg);
  }

  &.arrow-top {
    bottom: -5px;
    ::before {
      border-top: none;
      border-left: none;
    }
  }

  &.arrow-bottom {
    top: -5px;
    ::before {
      border-bottom: none;
      border-right: none;
    }
  }

  &.arrow-left {
    right: -5px;

    ::before {
      border-bottom: none;
      border-left: none;
    }
  }

  &.arrow-right {
    left: -5px;
    ::before {
      border-right: none;
      border-top: none;
    }
  }

  ::before {
    background: ${({ bgColor }) => bgColor || `var(${UI.COLOR_PAPER_DARKER})`};
    border: 1px solid ${({ bgColor }) => bgColor || `var(${UI.COLOR_PAPER_DARKEST})`};
  }
`
