import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const DividerHorizontal = styled.hr`
  border: 0;
  border-bottom: 1px solid var(${UI.COLOR_PAPER_DARKER});
  display: flex;
  width: 100%;
  margin: 0;
`

export const TimelineDot = styled.div`
  --size: 13px;
  width: var(--size);
  height: var(--size);
  border-radius: var(--size);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin: 0 0 0 1px;

  &::before {
    content: ' ';
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    margin: auto;
    width: 1px;
    height: calc(100% + 14px);
    background: var(${UI.COLOR_PAPER_DARKER});
    z-index: 0;
  }

  &::after {
    content: ' ';
    background: var(${UI.COLOR_PAPER_DARKER});
    border: 3px solid var(${UI.COLOR_PAPER});
    width: var(--size);
    height: var(--size);
    border-radius: var(--size);
    z-index: 1;
  }
`
