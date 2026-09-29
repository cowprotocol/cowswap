import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import styled from 'styled-components/macro'

import { type DialogVariant } from './Dialog.pure'

import { Media, MEDIA_WIDTHS } from '../../consts'
import { UI } from '../../enum'
import { OVERLAY_BACKDROP_EFFECT } from '../../styles/mixins'
import { transition } from '../../utils/animation'

export const Backdrop = styled(BaseDialog.Backdrop)`
  ${OVERLAY_BACKDROP_EFFECT}

  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: auto;
  transition: ${transition(['opacity'])};

  &[data-starting-style],
  &[data-ending-style] {
    opacity: 0;
  }
`

export const Viewport = styled(BaseDialog.Viewport)`
  position: fixed;
  inset: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
`

export const Popup = styled(BaseDialog.Popup)<{ $variant: DialogVariant }>`
  box-sizing: border-box;
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  width: calc(100% - 32px);
  max-height: calc(100dvh - 32px);
  max-width: ${(props) => (props.$variant === 'narrow' ? `${MEDIA_WIDTHS.upToExtraSmall}px` : '900px')};
  overflow: hidden;
  border-radius: var(${UI.BORDER_RADIUS_NORMAL});
  background: var(${UI.COLOR_PAPER});
  color: var(${UI.COLOR_TEXT});
  box-shadow: var(${UI.BOX_SHADOW});
  outline: none;
  transition: ${transition(['opacity', 'transform', 'width', 'height', 'max-width', 'max-height', 'border-radius'])};

  &.isSmall {
    max-width: 400px;
  }

  ${Media.upToSmall()} {
    width: calc(100% - 16px);
    max-height: calc(100dvh - 16px);
  }

  ${Media.upToExtraSmall()} {
    width: 100vw;
    max-width: 100vw;
    height: 100dvh;
    max-height: 100dvh;
    border-radius: 0;
  }

  &[data-starting-style],
  &[data-ending-style] {
    opacity: 0;
    transform: scale(0.98);
  }
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
