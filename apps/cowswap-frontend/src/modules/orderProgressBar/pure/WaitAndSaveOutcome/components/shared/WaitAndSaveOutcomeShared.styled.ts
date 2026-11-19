import { font, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { WAIT_AND_SAVE_HERO_FONT_MAX_PX } from '../../waitAndSaveOutcome.constants'

export const Wrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 100%;
  padding: 24px;
  overflow: hidden;
  border-radius: 24px;
  background: var(${UI.COLOR_SUCCESS_BG});
  color: var(${UI.COLOR_SUCCESS_TEXT});
`

export const TitleGroup = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
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
  ${font('FONT_MEDIUM', 'semibold')}
  color: var(${UI.COLOR_SUCCESS_TEXT});
  white-space: nowrap;
`

export const GainAmountSlot = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  min-width: 0;
`

export const GainAmount = styled.p<{ $isFitted: boolean }>`
  position: relative;
  margin: 0;
  width: max-content;
  font-size: ${WAIT_AND_SAVE_HERO_FONT_MAX_PX}px;
  font-weight: var(${UI.FONT_WEIGHT_BOLD});
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(${UI.COLOR_SUCCESS_TEXT});
  text-align: center;
  white-space: nowrap;
  filter: blur(${({ $isFitted }) => ($isFitted ? 0 : 4)}px);
  transition: filter var(${UI.ANIMATION_DURATION_SLOW}) ease-out;

  @media (prefers-reduced-motion: reduce) {
    filter: none;
    transition: none;
  }
`
