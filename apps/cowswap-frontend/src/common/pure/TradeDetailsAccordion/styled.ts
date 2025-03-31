import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

// Constant for the max-height animation.
// Needs to be larger than the accordion content will ever be.
const EXPANDED_MAX_HEIGHT_PX = 1000

export const Wrapper = styled.div<{ isOpen: boolean }>`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  width: 100%;
  padding: 6px;
  height: auto;
  font-size: 13px;
  font-weight: var(${UI.FONT_WEIGHT_MEDIUM});
`

export const Details = styled.div<{ isVisible: boolean }>`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  width: 100%;
  height: auto;
  max-height: ${({ isVisible }) => (isVisible ? `${EXPANDED_MAX_HEIGHT_PX}px` : '0')};
  margin: ${({ isVisible }) => (isVisible ? '4px 0 0' : '0')};
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
  visibility: ${({ isVisible }) => (isVisible ? 'visible' : 'hidden')};
  transform-origin: top;
  transition:
    opacity var(${UI.ANIMATION_DURATION_SLOW}) ease-in-out,
    visibility var(${UI.ANIMATION_DURATION_SLOW}) ease-in-out,
    max-height var(${UI.ANIMATION_DURATION_SLOW}) ease-in-out,
    margin var(${UI.ANIMATION_DURATION_SLOW}) ease-in-out,
    clip-path var(${UI.ANIMATION_DURATION_SLOW}) ease-out;

  // Target all children that have a class to make visible
  > [class] {
    width: 100%;
    transform-origin: top;
    opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
    transform: ${({ isVisible }) => (isVisible ? 'translateY(0)' : 'translateY(10px)')};
    transition: all var(${UI.ANIMATION_DURATION_SLOW}) ease-out;
  }
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
