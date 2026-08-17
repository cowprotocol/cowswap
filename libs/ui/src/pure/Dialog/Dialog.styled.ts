import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import styled from 'styled-components/macro'

import { UI } from '../../enum'
import { transition } from '../../utils/animation'

export const Backdrop = styled(BaseDialog.Backdrop)`
  position: fixed;
  inset: 0;
  z-index: 1000;
  background-color: var(${UI.MODAL_BACKDROP});
  --backdrop-opacity: 0.4;
  opacity: var(--backdrop-opacity);
  transition: ${transition(['opacity'])};

  &[data-starting-style],
  &[data-ending-style] {
    opacity: 0;
  }
`

export const Viewport = styled(BaseDialog.Viewport)`
  position: fixed;
  inset: 0;
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;

  & > * {
    pointer-events: auto;
  }
`

export const Popup = styled(BaseDialog.Popup)<{ $maxWidth: string }>`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: calc(100% - 32px);
  max-width: ${({ $maxWidth }) => $maxWidth};
  max-height: 90dvh;
  overflow: hidden;
  border-radius: var(${UI.BORDER_RADIUS_LARGE});
  background: var(${UI.COLOR_PAPER});
  color: var(${UI.COLOR_TEXT});
  box-shadow: var(${UI.BOX_SHADOW});
  outline: none;
  transition: ${transition(['opacity', 'transform'])};

  &[data-starting-style],
  &[data-ending-style] {
    opacity: 0;
    transform: scale(0.98);
  }
`

/** Stable header chrome outside the scrollable body. */
export const Header = styled.div`
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
`

export const Footer = styled.div`
  flex-shrink: 0;
`

export const VisuallyHiddenTitle = styled(BaseDialog.Title)`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`
