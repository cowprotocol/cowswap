import styled, { css } from 'styled-components/macro'

import { UI } from '../../enum'
import { transition } from '../../utils/animation'
import { font } from '../../utils/font'
import { BackIconButton } from '../IconButton/back/BackIconButton.pure'
import { CloseIconButton } from '../IconButton/close/CloseIconButton.pure'

export const Header = styled.header<{ withoutBorder?: boolean }>`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 16px;
  border-bottom: ${({ withoutBorder }) => (withoutBorder ? 'none' : `1px solid var(${UI.COLOR_BORDER})`)};
  transition: ${transition(['padding'])};

  &.hasBack {
    padding-left: 32px;
  }

  &.hasClose {
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
