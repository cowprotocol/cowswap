import { DialogContent, DialogOverlay } from '@reach/dialog'
import { animated } from '@react-spring/web'
import { transparentize } from 'color2k'
import styled, { css } from 'styled-components/macro'

import { UI } from '../../enum'

const AnimatedDialogOverlay = animated(DialogOverlay)
export const SmartModalOverlay = styled(AnimatedDialogOverlay)`
  &[data-reach-dialog-overlay] {
    z-index: 2;
    background-color: transparent;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${({ theme }) => (theme.darkMode ? 'rgba(0,0,0,.425)' : 'rgba(0,0,0,0.3)')};
    backdrop-filter: blur(5px);
  }
`

const AnimatedDialogContent = animated(DialogContent)
interface SmartModalContentAttrs {
  $mobile?: boolean
  $maxHeight?: number
  $minHeight?: number | false
}
export const SmartModalContent = styled(
  ({ $mobile, $maxHeight, $minHeight, ...rest }: SmartModalContentAttrs & Record<string, unknown>) => (
    <AnimatedDialogContent {...rest} />
  ),
).attrs<SmartModalContentAttrs>(() => ({
  'aria-label': 'dialog',
}))`
  overflow-y: auto;
  &[data-reach-dialog-content] {
    margin: 0 0 2rem 0;
    background: var(${UI.COLOR_PAPER});
    border: 1px solid var(${UI.COLOR_PAPER_DARKER});
    box-shadow: 0 4px 8px 0 ${({ theme }) => transparentize(theme.shadow1, 0.95)};
    padding: 0;
    width: 50vw;
    overflow-y: auto;
    overflow-x: hidden;
    align-self: ${({ $mobile }) => ($mobile ? 'flex-end' : 'center')};
    max-width: 420px;
    ${({ $maxHeight }) => $maxHeight != null && css`max-height: ${$maxHeight}vh;`}
    ${({ $minHeight }) => $minHeight !== false && $minHeight != null && css`min-height: ${$minHeight}vh;`}
    display: flex;
    border-radius: var(${UI.BORDER_RADIUS_NORMAL});
    ${({ $mobile }) =>
      $mobile &&
      css`
        width: 100vw;
        border-radius: 20px;
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
        padding: 0 0 58px;
      `}
  }
`

export const DropdownBackdrop = styled.div<{ $show: boolean; $zIndex: number }>`
  position: fixed;
  inset: 0;
  background-color: ${({ theme }) => (theme.darkMode ? 'rgba(0,0,0,.425)' : 'rgba(0,0,0,0.3)')};
  backdrop-filter: blur(5px);
  z-index: ${({ $zIndex }) => $zIndex};
  visibility: ${({ $show }) => ($show ? 'visible' : 'hidden')};
  opacity: ${({ $show }) => ($show ? 1 : 0)};
  transition:
    visibility 0.15s linear,
    opacity 0.15s linear;
`

export const DropdownPanel = styled.div`
  background: var(${UI.COLOR_PAPER});
  color: var(${UI.COLOR_TEXT_PAPER});
  box-shadow: var(${UI.BOX_SHADOW});
  // box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid var(${UI.COLOR_PAPER_DARKER});
  border-radius: 12px;
  // padding: 6px 3px;
  font-size: 13px;
  overflow: auto;
  border-radius: 12px;
`
