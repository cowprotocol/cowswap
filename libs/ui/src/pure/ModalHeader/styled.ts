import styled, { css } from 'styled-components/macro'

import { UI } from '../../enum'

import { BackButton } from '../BackButton'

export const blankButtonMixin = css`
  background: none;
  padding: 0;
  margin: 0;
  outline: none;
  border: 0;
  cursor: pointer;

  &:disabled {
    cursor: default;
  }
`

export const IconButton = styled.button`
  ${blankButtonMixin};

  color: inherit;
  opacity: 0.6;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    opacity: 1;
  }

  > svg {
    color: inherit;
  }
`

// TODO: Also used in trade mode selector (mobile) but missing border radius

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

export const BackButtonStyled = styled(BackButton)`
  position: absolute;
  top: 50%;
  left: 10px;
  transform: translateY(-50%);
  margin-right: 0;
`

export const CloseButtonStyled = styled(IconButton)`
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
`
