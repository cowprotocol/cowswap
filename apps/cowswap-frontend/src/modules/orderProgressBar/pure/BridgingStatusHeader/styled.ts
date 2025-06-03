import { TokenLogo as TokenLogoOriginal } from '@cowprotocol/tokens'
import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { BridgingFlowStep } from '../../types'

const stepColors: Record<BridgingFlowStep, { background: string; title: string }> = {
  bridgingInProgress: {
    background: UI.COLOR_BLUE_100_PRIMARY,
    title: UI.COLOR_BLUE_900_PRIMARY,
  },
  bridgingFailed: {
    background: UI.COLOR_ALERT_BG,
    title: UI.COLOR_ALERT_TEXT,
  },
  bridgingFinished: {
    background: UI.COLOR_SUCCESS_BG,
    title: UI.COLOR_SUCCESS_TEXT,
  },
  refundCompleted: {
    background: UI.COLOR_SUCCESS_BG,
    title: UI.COLOR_SUCCESS_TEXT,
  },
}

export const Header = styled.div<{ $step: BridgingFlowStep }>`
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  justify-content: center;
  gap: 20px;
  background: var(${({ $step }) => stepColors[$step].background});
  color: var(${({ $step }) => stepColors[$step].title});
  width: 100%;
  border-radius: 16px;
  text-align: center;
  padding: 20px;

  > h3 {
    margin: 0;
    font-size: 19px;
    color: inherit;
  }
`

export const HeaderState = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
`

const TOKEN_SIZE = '42px'
const CONNECTOR_HEIGHT = '2px'
const MARGIN_MULTIPLIER = 1.5
const CONNECTOR_OFFSET_MULTIPLIER = -1.25

export const TokenLogo = styled(TokenLogoOriginal)`
  --size: ${TOKEN_SIZE};
  --margin: calc(var(--size) * ${MARGIN_MULTIPLIER});
  --connector-offset: calc(var(--size) * ${CONNECTOR_OFFSET_MULTIPLIER});
  position: relative;

  &:before {
    content: '';
    display: block;
    width: var(--size);
    height: ${CONNECTOR_HEIGHT};
    background: var(${UI.COLOR_NEUTRAL_0});
    position: absolute;
    mix-blend-mode: soft-light;
  }

  &:first-child {
    margin-right: var(--margin);

    &:before {
      right: var(--connector-offset);
    }
  }

  &:last-child {
    margin-left: var(--margin);

    &:before {
      left: var(--connector-offset);
    }
  }
`
