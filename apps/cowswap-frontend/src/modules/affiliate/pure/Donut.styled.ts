import { Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const DonutRing = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
  z-index: 0;
  --radius: calc(50 - var(--stroke-width) / 2);

  circle {
    fill: none;
    stroke-width: var(--stroke-width);
  }

  .donut-track {
    stroke: var(${UI.COLOR_TEXT_OPACITY_10});
  }

  .donut-progress {
    stroke: var(${UI.COLOR_INFO});
    stroke-linecap: round;
    stroke-dasharray: 100;
    stroke-dashoffset: calc(100 - var(--value));
  }

  .donut-center {
    fill: var(${UI.COLOR_PAPER});
    stroke: none;
  }
`

export const DonutWrapper = styled.div<{ $value: number }>`
  --size: 139px;
  --thickness: 20px;
  --stroke-width: 14.4;
  --value: ${({ $value }) => $value};
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex: 0 0 auto;
  box-shadow: 0px 2.67px 5.33px 0px rgba(0, 0, 0, 0.12) inset;

  ${Media.upToExtraSmall()} {
    margin: 0 auto;
  }
`

export const DonutContent = styled.div`
  position: relative;
  z-index: 1;
  font-size: 12px;
  font-weight: 600;
  color: var(${UI.COLOR_TEXT});
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  text-align: center;

  > span {
    font-size: 24px;
  }

  small {
    font-size: 15px;
    color: var(${UI.COLOR_TEXT_OPACITY_60});
    font-weight: 400;
  }
`
