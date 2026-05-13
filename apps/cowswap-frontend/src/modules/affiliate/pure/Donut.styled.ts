import { Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Ring = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
  z-index: 0;

  .donut-track {
    fill: none;
    stroke: var(${UI.COLOR_TEXT_OPACITY_10});
  }

  .donut-progress {
    fill: none;
    stroke: var(${UI.COLOR_INFO});
    stroke-linecap: round;
  }

  .donut-center {
    fill: var(${UI.COLOR_PAPER});
    stroke: none;
  }
`

export const Wrapper = styled.div`
  --size: 139px;
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

export const Content = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60%;
  height: 60%;
`

export const ContentInner = styled.div`
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
  text-align: center;
  overflow: hidden;
`

export const LabelRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`

export const SubtitleRow = styled.div`
  width: 82%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`

export const Label = styled.span`
  display: inline-block;
  line-height: 1.2;
  font-size: 24px;
  font-weight: 600;
  color: var(${UI.COLOR_TEXT});
  white-space: nowrap;
  text-align: center;
`

export const Subtitle = styled.span`
  display: inline-block;
  line-height: 1.2;
  font-size: 15px;
  color: var(${UI.COLOR_TEXT_OPACITY_60});
  font-weight: 400;
  white-space: nowrap;
  text-align: center;
`
