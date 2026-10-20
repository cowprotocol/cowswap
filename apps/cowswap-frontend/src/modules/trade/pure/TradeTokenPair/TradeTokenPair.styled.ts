import { UI } from '@cowprotocol/ui'

import { ArrowRight } from 'react-feather'
import styled from 'styled-components/macro'

export const Wrapper = styled.div<{ $hasFooter: boolean }>`
  --size: 36px;
  --padding: 4px;

  display: flex;
  flex-direction: column;
  width: 100%;

  ${({ $hasFooter }) =>
    $hasFooter &&
    `
    > ${PairGrid} > * {
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }

    > ${PairGrid} > *:first-child {
      border-bottom-right-radius: 24px;
    }

    > ${PairGrid} > *:last-child {
      border-bottom-left-radius: 24px;
    }
  `}
`

export const PairGrid = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: max-content;
  gap: 6px;
  width: 100%;
  align-items: center;
  justify-content: space-between;
`

export const AmountsSeparator = styled(ArrowRight)`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: var(--size);
  height: var(--size);
  border-radius: var(--size);
  background: var(${UI.COLOR_PAPER_DARKER});
  border: var(--padding) solid var(${UI.COLOR_PAPER});
  padding: var(--padding);
  z-index: 1;
`

export const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  min-height: 40px;
  padding: 4px 8px;
  background: var(${UI.COLOR_PAPER});
  border: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
  border-top: none;
  border-radius: 0 0 24px 24px;
`
