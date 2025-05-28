import { Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { StyledToggleArrow } from '../ToggleArrow/styled'

export const Wrapper = styled.div<{ isOpen: boolean }>`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  width: 100%;
  padding: 6px;
  gap: 8px;
  height: auto;
  font-size: 13px;
  font-weight: var(${UI.FONT_WEIGHT_MEDIUM});

  ${Media.upToSmall()} {
    padding: 2px;
  }
`

export const Details = styled.div<{ isVisible: boolean }>`
  display: ${({ isVisible }) => (isVisible ? 'flex' : 'none')};
  height: ${({ isVisible }) => (isVisible ? 'auto' : '0')};
  margin: 0;
  flex-flow: row wrap;
  align-items: center;
  width: 100%;
`

export const Summary = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 10px;
  font-size: inherit;
  font-weight: inherit;

  span {
    font-size: inherit;
    font-weight: inherit;
  }
`

export const SummaryClickable = styled.div<{ isOpen: boolean }>`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-flow: row wrap;
  gap: 4px;
  color: ${({ isOpen }) => (isOpen ? `var(${UI.COLOR_TEXT})` : `var(${UI.COLOR_TEXT_OPACITY_70})`)};
  transition: all var(${UI.ANIMATION_DURATION}) ease-in-out;
  outline: none;
  font-size: inherit;
  font-weight: inherit;

  > span {
    text-align: right;
    gap: 4px;
    display: flex;
    flex: 0 0 auto;
  }

  > *:not(${StyledToggleArrow}) {
    opacity: ${({ isOpen }) => (isOpen ? '0' : '1')};
    visibility: ${({ isOpen }) => (isOpen ? 'hidden' : 'visible')};
    transition:
      opacity var(${UI.ANIMATION_DURATION}) ease-in-out,
      visibility var(${UI.ANIMATION_DURATION}) ease-in-out;
  }

  &:only-child {
    grid-column: 1 / -1;
  }
`
