import { Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import Input from 'legacy/components/NumericalInput'

export const Suffix = styled.span`
  margin: 0 0 0 3px;
  opacity: 0.7;
  font-weight: 600;
`

export const ArrowsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  inset-block-start: 0;
  inset-inline-end: 0;
  background: transparent;
  color: inherit;
  border-radius: 6px;
  display: flex;
  flex-flow: column wrap;
  align-items: stretch;
  width: 28px;
  gap: 3px;
  margin: 0 -16px 0 0;
  user-select: all; // Fix for preventing text selection on double click

  > span,
  > span > span {
    display: flex;
    flex-flow: column wrap;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: inherit;
  }

  > span {
    overflow: hidden;
    cursor: pointer;
    opacity: 0.5;
    transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out, color var(${UI.ANIMATION_DURATION}) ease-in-out;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: auto;
    height: 50%;

    &:hover {
      opacity: 1;

      > span > svg > path {
        fill: currentColor;
      }
    }
  }

  > span > span > svg {
    display: flex;
    --size: 12px;
    width: var(--size);
    height: var(--size);
    border-radius: var(--size);
    object-fit: contain;
    cursor: pointer;
    color: currentColor;
  }

  > span > span > svg > path {
    fill: currentColor;
  }

  > span:first-child > span > svg {
    transform: rotate(180deg);
  }
`

export const InputWrapper = styled.span<{ showUpDownArrows?: boolean; upDownArrowsLeftAlign?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;

  &:hover ${ArrowsWrapper} {
    opacity: 1;
  }

  ${({ upDownArrowsLeftAlign }) =>
    upDownArrowsLeftAlign &&
    `
    ${ArrowsWrapper} {
      order: -1;
      margin: 0;
    }
  `}
`

export const NumericalInput = styled(Input)<{ color?: string }>`
  color: ${({ color }) => {
    if (color === 'red') return `var(${UI.COLOR_DANGER})`
    if (color === 'yellow') return `var(${UI.COLOR_WARNING})`
    return 'inherit'
  }};
  display: flex;
  align-items: center;
  background: none;
  flex: 1;
  width: auto;
  height: 100%;
  font-size: 22px;
  font-weight: 500;

  ${Media.upToSmall()} {
    font-size: 20px;
  }
`
