import styled, { css } from 'styled-components/macro'

import { UI } from '../../enum'
import { slowTransition, transition } from '../../utils/animation'
import { font } from '../../utils/font'
import { BackIconButton } from '../IconButton/back/BackIconButton.pure'
import { CloseIconButton } from '../IconButton/close/CloseIconButton.pure'
import { MODAL_DEBUG, MODAL_ROOT_SCROLLED_CLASS } from '../Modal/Modal.constants'

interface ChromeEdgeProps {
  $bottomBorder?: boolean
  $contentMargin?: boolean
}

const chromeEdgeCss = css<ChromeEdgeProps>`
  ${({ $bottomBorder }) =>
    $bottomBorder &&
    css`
      border-bottom: 1px solid var(${UI.COLOR_BORDER});
    `}

  ${({ $contentMargin }) =>
    $contentMargin &&
    css`
      margin-bottom: 10px;
    `}
`

export const Header = styled.header<ChromeEdgeProps>`
  position: relative;
  background: ${MODAL_DEBUG ? 'red' : `var(${UI.COLOR_PAPER})`};
  // padding-bottom: 16px;

  ${chromeEdgeCss}

  &.sticky {
    position: sticky;
    top: 0;
    z-index: 1000;

    &::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      top: 100%;
      height: 40px;
      pointer-events: none;
      border-top: 1px solid transparent;
      backdrop-filter: blur(0);
      mask-image: linear-gradient(to bottom, black, transparent);
      -webkit-mask-image: linear-gradient(to bottom, black, transparent);
      transition: ${slowTransition(['border-top-color', 'backdrop-filter'])};
    }
  }

  .${MODAL_ROOT_SCROLLED_CLASS} &.sticky::after {
    border-top-color: var(${UI.COLOR_BORDER});
    backdrop-filter: blur(16px);
  }
`

export const Inner = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 0 16px;
  transition: ${transition(['padding'])};

  .hasBack & {
    padding-left: 32px;
  }

  .hasClose & {
    padding-right: 60px;
  }
`

export const Title = styled.div`
  ${font('FONT_LARGE', 'semibold')}

  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 16px 0;
`

export const RightSlot = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  overflow: hidden;
  max-width: 16rem;
  opacity: 1;
  transform: translateX(0);
  transition: ${transition(['opacity', 'max-width', 'transform'])};

  &[aria-hidden='true'] {
    max-width: 0;
    pointer-events: none;
    opacity: 0;
    transform: translateX(8px);
  }
`

export const Subtitle = styled.div`
  display: grid;
  grid-template-rows: 1fr;
  overflow: hidden;
  width: 100%;
  opacity: 1;
  transition: ${transition(['grid-template-rows', 'opacity', 'margin'])};
  margin-top: -16px;

  &[aria-hidden='true'] {
    pointer-events: none;
    grid-template-rows: 0fr;
    opacity: 0;
    margin: 0;
  }
`

export const SubtitleContent = styled.div`
  overflow: hidden;
  min-height: 0;
`

export const SubtitleLabel = styled.div`
  ${font('FONT_SMALL_PLUS', 'medium')}

  padding: 8px 16px;
  background: var(${UI.COLOR_PAPER});
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  text-overflow: ellipsis;
  white-space: nowrap;
`

const headerIconButtonCss = css`
  position: absolute;
  top: 50%;
  opacity: 1;
  transform: translate(0, -50%);
  transition: ${transition(['transform', 'opacity'])};

  &[aria-hidden='true'] {
    pointer-events: none;
    opacity: 0;

    &:disabled {
      /* Override IconButton's disabled opacity: 0.5 so the fade goes fully to 0 */
      cursor: default;
      opacity: 0;
    }
  }
`

export const BackButton = styled(BackIconButton)`
  ${headerIconButtonCss}
  --pressableInset: -18px 0 -18px -11px;
  left: 10px;

  &[aria-hidden='true'] {
    transform: translate(calc(-100% - 16px), -50%);
  }
`

export const CloseButton = styled(CloseIconButton)`
  ${headerIconButtonCss}
  right: 4px;

  &[aria-hidden='true'] {
    transform: translate(calc(100% + 16px), -50%);
  }
`

export const ScrollableBottomSlot = styled.div<ChromeEdgeProps>`
  width: 100%;
  ${chromeEdgeCss}
`
