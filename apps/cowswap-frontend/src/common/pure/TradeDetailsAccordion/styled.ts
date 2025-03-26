import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Wrapper = styled.div<{ isOpen: boolean }>`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  width: 100%;
  padding: 6px 10px;
  height: auto;
  font-size: 13px;
  font-weight: var(${UI.FONT_WEIGHT_MEDIUM});
`

export const Details = styled.div<{ isVisible: boolean }>`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  width: 100%;
  margin: ${({ isVisible }) => (isVisible ? '16px 0 0' : '0')};
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
  visibility: ${({ isVisible }) => (isVisible ? 'visible' : 'hidden')};
  max-height: ${({ isVisible }) => (isVisible ? '1000px' : '0')};
  overflow: hidden;
  transform-origin: top;
  clip-path: ${({ isVisible }) => (isVisible ? 'inset(0 0 0 0)' : 'inset(0 0 100% 0)')};
  transition:
    opacity var(${UI.ANIMATION_DURATION}) ease-in-out,
    visibility var(${UI.ANIMATION_DURATION}) ease-in-out,
    max-height var(${UI.ANIMATION_DURATION}) ease-in-out,
    margin var(${UI.ANIMATION_DURATION}) ease-in-out,
    clip-path var(${UI.ANIMATION_DURATION}) ease-out;

  // Target all children that have a class to make visible
  > [class] {
    width: 100%;
    transform-origin: top;
    opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
    transform: ${({ isVisible }) => (isVisible ? 'translateY(0)' : 'translateY(10px)')};
    transition: all var(${UI.ANIMATION_DURATION}) ease-out;
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

export const ProtocolIcon = styled.div<{ bgColor?: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--size);
  height: var(--size);
  border-radius: var(--size);
  overflow: hidden;
  background: ${({ bgColor }) => (bgColor ? `var(${bgColor})` : 'transparent')};
  z-index: 2;
  border: 2px solid var(${UI.COLOR_PAPER});
  box-sizing: content-box;

  > svg,
  > span {
    object-fit: contain;
    width: 100%;
    height: 100%;
    padding: ${({ bgColor }) => (bgColor ? '3px' : '0')};
  }
`

export const ProtocolIconsContainer = styled.div`
  --size: 18px;
  display: inline-flex;
  align-items: center;

  // Negative margin to the left of the next icon
  > ${ProtocolIcon}:not(:first-child) {
    margin-left: calc(var(--size) * -0.6);
    z-index: 1;
  }

  > ${ProtocolIcon}:hover {
    z-index: 3;
  }
`
