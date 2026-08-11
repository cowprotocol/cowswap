import styled from 'styled-components/macro'

import { UI } from '../../enum'
import { BackIconButton } from '../IconButton/back/BackIconButton.pure'
import { CloseIconButton } from '../IconButton/close/CloseIconButton.pure'

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
  transition: padding var(${UI.ANIMATION_DURATION}) ease-in-out;

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

export const BackButtonStyled = styled(BackIconButton)`
  --pressableInset: -17px -11px;

  position: absolute;
  top: 50%;
  left: 10px;
  transform: translateY(-50%);
`

export const CloseButtonStyled = styled(CloseIconButton)`
  --pressableInset: -17px -11px;

  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
`
