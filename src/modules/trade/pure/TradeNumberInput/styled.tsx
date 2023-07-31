import { transparentize } from 'polished'
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
  /* position: absolute; */
  position: relative;
  inset-block-start: 0;
  inset-inline-end: 0;
  background: transparent;
  border-start-start-radius: 0;
  border-start-end-radius: 6px;
  border-end-end-radius: 6px;
  border-end-start-radius: 0;
  display: flex;
  flex-flow: column wrap;
  align-items: stretch;
  /* height: calc(100% + 20px); */
  /* top: -10px; */
  /* right: 0; */
  width: 28px;
  gap: 3px;
  margin: 0 -16px 0 0;

    > span,
    > span > span {
      display: flex;
      flex-flow: column wrap;
      align-items: center;
      justify-content: center;
      height: 100%;
    }

    > span {
      overflow: hidden;
      cursor: pointer;
      /* border-inline-end: 1px solid ${({ theme }) => transparentize(0.9, theme.text1)}; */
      transition: color 0.2s linear;
      display: flex;
      align-items: center;
      justify-content: center;
      flex: auto;
      height: 50%;

      &:hover {
        /* height: 60%; */

        > span > svg > path {
          fill: ${({ theme }) => theme.text1};
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
    }

    > span > span > svg > path {
      fill: ${({ theme }) => transparentize(0.7, theme.text1)};
      transition: fill 0.2s linear;
    }

    > span:first-child > span > svg {
      transform: rotate(180deg);
    }

    > span:last-child {
      /* border-block-start: 1px solid ${({ theme }) => transparentize(0.9, theme.text1)}; */
    }
`

export const InputWrapper = styled.span<{ showUpDownArrows?: boolean; upDownArrowsLeftAlign?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  /* padding: ${({ showUpDownArrows }) => (showUpDownArrows ? '0 36px 0 0' : '0')};
  margin: ${({ showUpDownArrows }) => (showUpDownArrows ? '0 -16px 0 0' : '0')}; */

  &:hover ${ArrowsWrapper} {
    opacity: 1;
  }

  ${({ upDownArrowsLeftAlign }) =>
    upDownArrowsLeftAlign &&
    `
    ${ArrowsWrapper} {
      // right: auto;
      // left: 0;
      order: -1;
      margin: 0;
    }
  `}
`

export const NumericalInput = styled(Input)<{ color?: string }>`
  color: ${({ theme, color }) => {
    if (color === 'red') return theme.red1
    if (color === 'yellow') return theme.yellow2
    return theme.text1
  }};
  display: flex;
  align-items: center;
  background: none;
  flex: 1;
  width: auto;
  height: 100%;
  font-size: 22px;
  font-weight: 500;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 20px;
  `}
`
