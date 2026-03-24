import { DialogContent, DialogOverlay } from '@reach/dialog'
import { animated } from '@react-spring/web'
import { transparentize } from 'color2k'
import styled, { css } from 'styled-components/macro'

import { UI } from '../../enum'

const AnimatedDialogOverlay = animated(DialogOverlay)
/** Match DEFAULT_Z_INDEX in SmartModal.pure when $zIndex is omitted */
const SMART_MODAL_OVERLAY_Z_DEFAULT = 1000

export const SmartModalOverlay = styled(AnimatedDialogOverlay)<{ $zIndex?: number }>`
  &[data-reach-dialog-overlay] {
    z-index: ${({ $zIndex }) => $zIndex ?? SMART_MODAL_OVERLAY_Z_DEFAULT};
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
  /** When true, dialog chrome is transparent so an inner DropdownPanel provides the solid surface. */
  $noSurface?: boolean
  /** Wider modals (e.g. token selector); ignored in $mobile drawer mode. */
  $contentMaxWidth?: string
}

export const SmartModalContent = styled(
  ({
    $mobile: _,
    $maxHeight: __,
    $minHeight: ___,
    $noSurface: ____,
    $contentMaxWidth: _____,
    ...rest
  }: SmartModalContentAttrs & Record<string, unknown>) => <AnimatedDialogContent {...rest} />,
).attrs<SmartModalContentAttrs>(() => ({
  'aria-label': 'dialog',
}))`
  /* Shell does not scroll; inner DropdownPanelScroller is the single scrollport (avoids nested scrollbars). */
  overflow: hidden;

  &[data-reach-dialog-content] {
    --dropdownTextSize: 13px;

    background: var(${UI.COLOR_PAPER});
    border: 1px solid var(${UI.COLOR_PAPER_DARKER});
    box-shadow: 0 4px 8px 0 ${({ theme }) => transparentize(theme.shadow1, 0.95)};
    padding: 0;
    width: 50vw;
    overflow: hidden;
    overflow-x: hidden;
    align-self: ${({ $mobile }) => ($mobile ? 'flex-end' : 'center')};
    max-width: 420px;
    display: flex;
    flex-direction: column;
    /* Flex child of overlay: allow shrinking below content so max-height + inner scroll work */
    min-height: 0;

    ${({ $maxHeight }) =>
      $maxHeight != null &&
      css`
        max-height: ${$maxHeight}vh;
      `}
    ${({ $minHeight }) =>
      $minHeight !== false &&
      $minHeight != null &&
      css`
        min-height: ${$minHeight}vh;
      `}
    display: flex;
    border-radius: var(${UI.BORDER_RADIUS_NORMAL});
    // margin: 0 0 2rem 0;
    margin: 0;

    ${({ $mobile }) =>
      $mobile &&
      css`
        width: 100vw;
        border-radius: 20px;
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
        padding: 0 0 58px;
      `}

    ${({ $noSurface }) =>
      $noSurface &&
      css`
        background: transparent;
        border: none;
        box-shadow: none;
      `}

    ${({ $contentMaxWidth, $mobile }) =>
      $contentMaxWidth &&
      !$mobile &&
      css`
        max-width: ${$contentMaxWidth};
        width: min(96vw, ${$contentMaxWidth});
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

export const DropdownPanel = styled.div<{ $mobile?: boolean }>`
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  background: var(${UI.COLOR_PAPER});
  color: var(${UI.COLOR_TEXT_PAPER});
  box-shadow: var(${UI.BOX_SHADOW});
  border: 1px solid var(${UI.COLOR_PAPER_DARKER});
  border-radius: 12px;
  font-size: 13px;
  border-radius: 12px;
  max-height: 100%;
  overflow: hidden;

  ${({ $mobile }) =>
    $mobile &&
    css`
      border-radius: 0;
      box-shadow: none;
      border: none;
    `}// padding: 6px 3px;
  // box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`

export const DropdownPanelScroller = styled.div<{ $panelScrolls?: boolean }>`
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: ${({ $panelScrolls = true }) => ($panelScrolls ? 'auto' : 'hidden')};
  max-height: 100%;
`
