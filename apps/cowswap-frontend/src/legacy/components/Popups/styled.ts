import { UI } from '@cowprotocol/ui'

import { animated } from '@react-spring/web'
import { X } from 'react-feather'
import styled, { DefaultTheme, FlattenInterpolation, ThemeProps } from 'styled-components/macro'

const Fader = styled.div`
  position: absolute;
  bottom: 0px;
  left: 0px;
  width: 100%;
  height: 2px;
  background-color: var(${UI.COLOR_PAPER_DARKER});
`

export const PopupWrapper = styled.div<{ css?: FlattenInterpolation<ThemeProps<DefaultTheme>> }>`
  display: inline-block;
  width: 100%;
  background-color: var(${UI.COLOR_PAPER});
  position: relative;
  border-radius: 10px;
  padding: 20px 35px 20px 20px;
  overflow: hidden;
  border: 2px solid var(${UI.COLOR_TEXT_OPACITY_50});

  ${Fader} {
    background-color: var(${UI.COLOR_TEXT_OPACITY_50});
    height: 4px;
  }

  a {
    text-decoration: underline;
    color: inherit;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    min-width: 290px;
    margin: 0 0 16px;
    min-width: 100%;

    &:not(:last-of-type) {
      margin-right: 20px;
    }
  `}

  ${({ css }) => css && css}
`

export const StyledClose = styled(X)`
  position: absolute;
  right: 10px;
  top: 10px;
  color: inherit;
  opacity: 0.7;
  transition: opacity ${UI.ANIMATION_DURATION} ease-in-out;

  &:hover {
    opacity: 1;
  }

  svg {
    stroke: currentColor;
  }

  :hover {
    cursor: pointer;
  }
`

export const AnimatedFader = animated(Fader)
