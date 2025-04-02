import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const DividerHorizontal = styled.hr<{ margin?: string }>`
  border: 0;
  border-bottom: 1px solid var(${UI.COLOR_TEXT});
  display: flex;
  width: 100%;
  margin: ${({ margin }) => margin || '4px auto'};
  opacity: 0.1;
`

export const TimelineDot = styled.div<{ isLast?: boolean }>`
  --size: 13px;
  --timeline-line-height: calc(100% + 11px);
  width: var(--size);
  height: var(--size);
  border-radius: var(--size);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin: 0 0 0 1px;
  opacity: 0.15;

  &::before {
    content: ' ';
    position: absolute;
    top: ${({ isLast }) => (isLast ? 'calc(var(--timeline-line-height) / 2 * -1)' : '0')};
    bottom: 0;
    right: 0;
    left: 0;
    margin: auto;
    width: 1px;
    height: ${({ isLast }) => (isLast ? 'calc(var(--timeline-line-height) / 2)' : 'var(--timeline-line-height)')};
    background: var(${UI.COLOR_TEXT});
    z-index: 0;
  }

  &::after {
    content: ' ';
    background: var(${UI.COLOR_TEXT});
    border: 3px solid var(${UI.COLOR_PAPER});
    width: var(--size);
    height: var(--size);
    border-radius: var(--size);
    z-index: 1;
  }
`
