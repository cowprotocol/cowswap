import { font, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import svgDotRampSrc from './assets/dot-ramp.svg'

export const Wrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  padding: 24px;
  overflow: hidden;
  border-radius: 24px;
  background: var(${UI.COLOR_SUCCESS_BG});
  color: var(${UI.COLOR_SUCCESS_TEXT});
`

export const DotRamp = styled.div`
  position: absolute;
  inset: 0 auto auto 0;
  width: 100%;
  height: 203px;
  pointer-events: none;
  background: url(${svgDotRampSrc}) no-repeat top left / cover;
  opacity: 0.9;
`

export const TopRow = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
`

export const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`

export const SparkleIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  color: var(${UI.COLOR_SUCCESS_TEXT});

  > svg {
    width: 100%;
    height: 100%;
  }

  > svg path {
    fill: currentColor;
  }
`

export const Title = styled.span`
  ${font('FONT_NORMAL', 'semibold')}
  color: var(${UI.COLOR_SUCCESS_TEXT});
  white-space: nowrap;
`

export const GainPill = styled.span`
  ${font('FONT_SMALL', 'bold')}
  flex-shrink: 0;
  padding: 3px 9px;
  border-radius: 999px;
  background: var(${UI.COLOR_SUCCESS});
  color: var(${UI.COLOR_PAPER});
  white-space: nowrap;
`

export const Hero = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`

export const GainAmount = styled.p`
  margin: 0;
  font-size: 34px;
  font-weight: var(${UI.FONT_WEIGHT_BOLD});
  line-height: 1.1;
  color: var(${UI.COLOR_SUCCESS_TEXT});
  word-break: break-word;
`

export const SubRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
`

export const SubText = styled.span`
  ${font('FONT_NORMAL', 'regular')}
  color: var(${UI.COLOR_SUCCESS_TEXT});
  opacity: 0.75;
`

export const Proof = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  padding-top: 8px;
`

export const BarTrack = styled.div`
  display: flex;
  width: 100%;
  height: 8px;
  overflow: hidden;
  border-radius: 4px;
`

export const AloneBar = styled.div<{ $flex: number }>`
  flex: ${({ $flex }) => $flex} 1 0;
  min-width: 0;
  height: 100%;
  background: color-mix(in srgb, var(${UI.COLOR_SUCCESS_TEXT}) 28%, transparent);
  border-radius: 4px 0 0 4px;
`

export const GainBar = styled.div<{ $flex: number; $minWidthPx: number }>`
  flex: ${({ $flex }) => $flex} 1 0;
  min-width: ${({ $minWidthPx }) => $minWidthPx}px;
  height: 100%;
  background: var(${UI.COLOR_SUCCESS});
  border-radius: 0 4px 4px 0;
`

export const Legend = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  flex-wrap: wrap;
`

export const LegendItem = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
`

export const LegendSwatch = styled.span<{ $tone: 'alone' | 'gain' }>`
  flex-shrink: 0;
  width: 10px;
  height: 10px;
  border-radius: 2px;
  background: ${({ $tone }) =>
    $tone === 'gain'
      ? `var(${UI.COLOR_SUCCESS})`
      : `color-mix(in srgb, var(${UI.COLOR_SUCCESS_TEXT}) 28%, transparent)`};
`

export const LegendLabel = styled.span<{ $emphasized?: boolean }>`
  ${({ $emphasized }) => ($emphasized ? font('FONT_SMALL', 'semibold') : font('FONT_SMALL', 'regular'))}
  color: var(${UI.COLOR_SUCCESS_TEXT});
  opacity: ${({ $emphasized }) => ($emphasized ? 1 : 0.75)};
`
