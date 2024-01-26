import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const DividerHorizontal = styled.hr`
  border: 0;
  border-bottom: 1px solid var(${UI.COLOR_PAPER_DARKER});
  display: flex;
  width: 100%;
  margin: 10px 0;
`

export const TimelineDot = styled.div`
  --size: 9px;
  width: var(--size);
  height: var(--size);
  border-radius: var(--size);
  background-color: var(${UI.COLOR_PAPER_DARKER});
  border: 1px solid var(${UI.COLOR_PAPER});
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  &::before {
    content: ' ';
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    margin: auto;
    width: 1px;
    height: 100%;
    background: var(${UI.COLOR_PAPER_DARKER});
  }
`
