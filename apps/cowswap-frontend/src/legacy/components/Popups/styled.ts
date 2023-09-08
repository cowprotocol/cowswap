import { animated } from '@react-spring/web'
import { X } from 'react-feather'
import styled, { DefaultTheme, FlattenInterpolation, ThemeProps } from 'styled-components/macro'

import { UI } from 'common/constants/theme'

const Fader = styled.div`
  position: absolute;
  bottom: 0px;
  left: 0px;
  width: 100%;
  height: 2px;
  background-color: ${({ theme }) => theme.bg3};
`

export const PopupWrapper = styled.div<{ css?: FlattenInterpolation<ThemeProps<DefaultTheme>> }>`
  display: inline-block;
  width: 100%;
  //padding: 1em;
  background-color: var(${UI.COLOR_CONTAINER_BG_01});
  position: relative;
  border-radius: 10px;
  padding: 20px 35px 20px 20px;
  overflow: hidden;
  border: 2px solid ${({ theme }) => theme.black};
  box-shadow: 2px 2px 0 ${({ theme }) => theme.black};

  ${Fader} {
    background-color: ${({ theme }) => theme.disabled};
    height: 4px;
  }

  a {
    text-decoration: underline;
    color: ${({ theme }) => theme.textLink};
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

  :hover {
    cursor: pointer;
  }
`

export const AnimatedFader = animated(Fader)
