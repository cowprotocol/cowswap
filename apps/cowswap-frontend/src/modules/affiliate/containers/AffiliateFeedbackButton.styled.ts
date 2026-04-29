import { ButtonIcon, ButtonLabel, ButtonOutlined, Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  flex: 0 0 auto;
  width: auto;
  cursor: pointer;

  ${Media.upToSmall()} {
    justify-content: stretch;
    width: 100%;
  }
`

export const Button = styled(ButtonOutlined).attrs({
  minHeight: 32,
})`
  width: auto;
  min-width: 0;
  padding: 5px 12px;
  background: transparent;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  border-color: var(${UI.COLOR_TEXT_OPACITY_25});
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: var(${UI.COLOR_PAPER_DARKER});
    color: var(${UI.COLOR_TEXT});
    border-color: transparent;
  }

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }

  ${Media.upToSmall()} {
    width: 100%;
  }
`

export const Icon = styled(ButtonIcon)`
  width: 18px;
  height: 18px;

  > svg {
    width: 100%;
    height: 100%;
    object-fit: contain;
    color: inherit;
    fill: currentColor;
  }

  > svg path {
    fill: currentColor;
  }
`

export const Label = styled(ButtonLabel)`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
`
