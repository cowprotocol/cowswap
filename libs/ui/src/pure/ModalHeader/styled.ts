import styled, { css } from 'styled-components/macro'

import { UI } from '../../enum'
import { BackIconButton } from '../IconButton/back/BackIconButton.pure'
import { CloseIconButton } from '../IconButton/close/CloseIconButton.pure'

// TODO: debug — revert to var(${UI.ANIMATION_DURATION})
const DEBUG_TRANSITION_DURATION = '10s'

export const Header = styled.header<{ withoutBorder?: boolean }>`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-weight: 500;
  padding: 16px;
  font-size: 17px;
  border-bottom: ${({ withoutBorder }) => (withoutBorder ? 'none' : `1px solid var(${UI.COLOR_BORDER})`)};
  background: pink !important;
  transition: padding ${DEBUG_TRANSITION_DURATION} ease-in-out;

  &.hasBack {
    padding-left: 40px;
  }

  &.hasClose {
    padding-right: 40px;
  }
`

export const Title = styled.div`
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
  --pressableInset: -17px -11px;

  position: absolute;
  top: 50%;
  opacity: 1;
  transform: translate(0, -50%);
  transition:
    transform ${DEBUG_TRANSITION_DURATION} ease-in-out,
    opacity ${DEBUG_TRANSITION_DURATION} ease-in-out;

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
  left: 10px;

  &[aria-hidden='true'] {
    transform: translate(calc(-100% - 16px), -50%);
  }
`

export const CloseButton = styled(CloseIconButton)`
  ${headerIconButtonCss}
  right: 10px;

  &[aria-hidden='true'] {
    transform: translate(calc(100% + 16px), -50%);
  }
`
