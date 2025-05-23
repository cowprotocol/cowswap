import { TokenLogo as TokenLogoOriginal } from '@cowprotocol/tokens'
import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { BridgingFlowStep } from '../../types'

const backgroundColors: Record<BridgingFlowStep, string> = {
  bridgingInProgress: UI.COLOR_COWAMM_LIGHT_BLUE,
  bridgingFailed: UI.COLOR_COWAMM_LIGHT_ORANGE,
  bridgingFinished: UI.COLOR_COWAMM_LIGHTER_GREEN,
  refundCompleted: UI.COLOR_COWAMM_LIGHTER_GREEN,
}

const titleColors: Record<BridgingFlowStep, string> = {
  bridgingInProgress: '#052B65', // TODO: merge with existing Color.cowfi_darkBlue
  bridgingFailed: '#996815',
  bridgingFinished: '#007B28',
  refundCompleted: '#007B28',
}

export const Header = styled.div<{ $step: BridgingFlowStep }>`
  background: var(${({ $step }) => backgroundColors[$step]});
  color: ${({ $step }) => titleColors[$step]};
  width: 100%;
  border-radius: 16px;
  text-align: center;
  padding: 20px;

  h3 {
    margin: 20px 0 0 0;
  }
`

export const HeaderState = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
`

export const TokenLogo = styled(TokenLogoOriginal)`
  --size: 42px;
  position: relative;

  &:before {
    content: '';
    display: block;
    width: var(--size);
    height: 2px;
    background: #000;
    position: absolute;
    mix-blend-mode: soft-light;
  }

  &:first-child {
    margin-right: calc(var(--size) * 1.5);

    &:before {
      right: calc(var(--size) * -1.25);
    }
  }

  &:last-child {
    margin-left: calc(var(--size) * 1.5);

    &:before {
      left: calc(var(--size) * -1.25);
    }
  }
`
