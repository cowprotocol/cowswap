import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

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
  display: grid;
  grid-template-columns: 1fr auto;
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

export const ToggleIcon = styled.div<{ isOpen: boolean }>`
  --size: var(${UI.ICON_SIZE_SMALL});
  transform: ${({ isOpen }) => (isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: transform var(${UI.ANIMATION_DURATION}) ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--size);
  height: var(--size);

  > svg {
    --size: var(${UI.ICON_SIZE_TINY});
    width: var(--size);
    height: var(--size);
    object-fit: contain;
    transition: fill var(${UI.ANIMATION_DURATION}) ease-in-out;

    path {
      fill: var(${UI.COLOR_TEXT_OPACITY_70});
    }
  }
`

export const SummaryClickable = styled.div<{ isOpen: boolean }>`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  color: ${({ isOpen }) => (isOpen ? `var(${UI.COLOR_TEXT})` : `var(${UI.COLOR_TEXT_OPACITY_70})`)};
  transition: all var(${UI.ANIMATION_DURATION}) ease-in-out;
  outline: none;
  font-size: inherit;
  font-weight: inherit;

  > *:not(${ToggleIcon}) {
    opacity: ${({ isOpen }) => (isOpen ? '0' : '1')};
    visibility: ${({ isOpen }) => (isOpen ? 'hidden' : 'visible')};
    transition:
      opacity var(${UI.ANIMATION_DURATION}) ease-in-out,
      visibility var(${UI.ANIMATION_DURATION}) ease-in-out;
  }

  &:hover {
    color: var(${UI.COLOR_TEXT});

    ${ToggleIcon} {
      > svg {
        path {
          fill: var(${UI.COLOR_TEXT});
        }
      }
    }
  }

  // If it's the only child, make it take all the space
  &:only-child {
    grid-column: 1 / -1;
  }
`
