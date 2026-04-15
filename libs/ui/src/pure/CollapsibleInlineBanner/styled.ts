import styled from 'styled-components/macro'

import { UI } from '../../enum'
import { InlineBanner } from '../InlineBanner'

export const ToggleIconContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 6px;
  border-radius: 16px;
  cursor: pointer;
  outline: none;
  transition:
    background var(${UI.ANIMATION_DURATION}) ease-in-out,
    opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    opacity: 0.8;
    background: var(${UI.COLOR_PAPER_DARKEST});
  }
`

export const StyledToggleArrow = styled.div<{ isOpen: boolean }>`
  --size: 12px;
  transform: ${({ isOpen }) => (isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: transform var(${UI.ANIMATION_DURATION}) ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--size);
  height: var(--size);
  color: var(${UI.COLOR_TEXT_OPACITY_50});
  flex-shrink: 0;

  &:hover {
    color: var(${UI.COLOR_TEXT});
  }

  > svg {
    width: var(--size);
    height: var(--size);
    object-fit: contain;
    color: inherit;

    path {
      fill: currentColor;
      transition: fill var(${UI.ANIMATION_DURATION}) ease-in-out;
    }
  }
`

export const ClickableWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 10px;
`

export const StyledCollapsibleBanner = styled(InlineBanner)<{ $isExpanded?: boolean }>`
  padding: ${({ $isExpanded }) => ($isExpanded ? '10px' : '6px')};

  > span {
    width: 100%;
  }
`
