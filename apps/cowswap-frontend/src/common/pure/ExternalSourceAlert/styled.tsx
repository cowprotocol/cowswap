import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Contents = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 5px;
  padding: 20px;
  margin: 0;
  border-radius: 20px;
  color: var(${UI.COLOR_DANGER_TEXT});
  background: var(${UI.COLOR_DANGER_BG});

  > svg > path,
  > svg > line {
    stroke: var(${UI.COLOR_DANGER_TEXT});
    stroke-width: 2px;
  }
`

export const Title = styled.h4`
  font-size: 24px;
  text-align: center;
  margin: 16px 0;
  font-weight: bold;
  width: 100%;
`

export const AcceptanceBox = styled.label`
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin: 16px auto 0;
  padding: 24px 0;
  border-top: 1px solid var(${UI.COLOR_DANGER_TEXT});
  width: 100%;
  font-size: 18px;
  font-weight: bold;
  transition: all var(${UI.ANIMATION_DURATION}) ease-in-out;
  border-radius: 0;

  &:hover {
    background: var(${UI.COLOR_DANGER_BG});
    border-radius: 12px;
  }

  > input {
    --size: 18px;
    width: var(--size);
    height: var(--size);
    border-radius: 4px;
    border: 1px solid var(${UI.COLOR_DANGER_TEXT});
    background: var(${UI.COLOR_PAPER});
    appearance: none;
    position: relative;

    &:checked {
      background: var(${UI.COLOR_DANGER_TEXT});

      &::after {
        content: '✓';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: var(${UI.COLOR_PAPER});
        font-size: 14px;
        font-weight: bold;
      }
    }
  }
`
