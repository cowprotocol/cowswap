import styled, { css } from 'styled-components/macro'

import { UI } from '../../enum'
import { slowTransition, transition } from '../../utils/animation'
import { font } from '../../utils/font'
import { BackIconButton } from '../IconButton/back/BackIconButton.pure'
import { CloseIconButton } from '../IconButton/close/CloseIconButton.pure'
import { MODAL_DEBUG, MODAL_ROOT_SCROLLED_CLASS } from '../Modal/Modal.constants'

export const Header = styled.header<{ withoutBorder?: boolean }>`
  position: relative;
  background: ${MODAL_DEBUG ? 'red' : `var(${UI.COLOR_PAPER})`};
  border-bottom: ${({ withoutBorder }) => (withoutBorder ? 'none' : `1px solid var(${UI.COLOR_BORDER})`)};
  transition: ${slowTransition(['border-color'])};

  &.sticky {
    position: sticky;
    top: 0;
    z-index: 1000;
    border-bottom: 1px solid transparent;

    &::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      top: 100%;
      height: 40px;
      pointer-events: none;
      backdrop-filter: blur(0);
      mask-image: linear-gradient(to bottom, black, transparent);
      -webkit-mask-image: linear-gradient(to bottom, black, transparent);
      transition: ${slowTransition(['backdrop-filter'])};
    }
  }

  .${MODAL_ROOT_SCROLLED_CLASS} &.sticky {
    border-bottom-color: var(${UI.COLOR_BORDER});
    // box-shadow: 0 0 32px 32px var(${UI.COLOR_PAPER});
  }

  .${MODAL_ROOT_SCROLLED_CLASS} &.sticky::after {
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
  padding: 16px;
  overflow: hidden;
  transition: ${transition(['padding'])};

  .hasBack & {
    padding-left: 32px;
  }

  .hasClose & {
    padding-right: 32px;
  }
`

export const Title = styled.div`
  ${font('FONT_LARGE', 'semibold')}

  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
`

export const RightSlot = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
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
  --pressableInset: -18px -11px -18px 0;
  right: 10px;

  &[aria-hidden='true'] {
    transform: translate(calc(100% + 16px), -50%);
  }
`
