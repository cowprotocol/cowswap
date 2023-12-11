import React from 'react'

import { UI } from '@cowprotocol/ui'

import { DialogContent, DialogOverlay } from '@reach/dialog'
import { animated } from '@react-spring/web'
import { transparentize } from 'color2k'
import styled, { css } from 'styled-components/macro'

export const HeaderRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  padding: 1rem 1rem;
  font-weight: 600;
  color: ${(props) => (props.color === 'blue' ? ({ theme }) => theme.primary1 : 'inherit')};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem;
  `};
`

export const CloseIcon = styled.div`
  position: absolute;
  right: 14px;
  top: 14px;
  opacity: 0.6;
  cursor: pointer;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    opacity: 1;
  }
`

export const HoverText = styled.div`
  text-decoration: none;
  color: inherit;
  display: flex;
  align-items: center;

  :hover {
    cursor: pointer;
  }
`

export const ContentWrapper = styled.div`
  /* background-color: ${({ theme }) => theme.bg0}; */
  background-color: var(${UI.COLOR_PAPER});
  padding: 0 1rem 1rem 1rem;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  ${({ theme }) => theme.mediaWidth.upToMedium`padding: 0 1rem 1rem 1rem`};
`

const AnimatedDialogOverlay = animated(DialogOverlay)
export const StyledDialogOverlay = styled(AnimatedDialogOverlay)`
  &[data-reach-dialog-overlay] {
    z-index: 2;
    background-color: transparent;
    overflow: hidden;

    display: flex;
    align-items: center;
    justify-content: center;

    background-color: ${({ theme }) => theme.modalBG};
    backdrop-filter: blur(5px);
  }
`

const AnimatedDialogContent = animated(DialogContent)
// destructure to not pass custom props to Dialog DOM element
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const StyledDialogContent = styled(({ ...rest }) => <AnimatedDialogContent {...rest} />).attrs<{
  $mobile: boolean
}>({
  'aria-label': 'dialog',
})`
  overflow-y: auto;

  &[data-reach-dialog-content] {
    margin: 0 0 2rem 0;
    background: var(${UI.COLOR_PAPER});
    border: 1px solid var(${UI.COLOR_PAPER_DARKER});
    box-shadow: 0 4px 8px 0 ${({ theme }) => transparentize(theme.shadow1, 0.95)};
    padding: 0px;
    width: 50vw;
    overflow-y: auto;
    overflow-x: hidden;
    align-self: ${({ $mobile }) => ($mobile ? 'flex-end' : 'center')};
    max-width: 420px;
    ${({ $maxHeight }) =>
      $maxHeight &&
      css`
        max-height: ${$maxHeight}vh;
      `}
    ${({ $minHeight }) =>
      $minHeight &&
      css`
        min-height: ${$minHeight}vh;
      `}
    display: flex;
    border-radius: 20px;
    ${({ theme }) => theme.mediaWidth.upToMedium`
      width: 65vw;
      margin: 0;
    `}
    ${({ theme, $mobile }) => theme.mediaWidth.upToSmall`
      width:  85vw;
      ${
        $mobile &&
        css`
          width: 100vw;
          border-radius: 20px;
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
        `
      }
    `}
  }
`
