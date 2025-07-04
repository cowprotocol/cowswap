import { TokenLogo as TokenLogoOriginal } from '@cowprotocol/tokens'
import { Media, UI } from '@cowprotocol/ui'

import styled, { DefaultTheme } from 'styled-components/macro'

import { BridgingFlowStep } from '../../types'

const STEP_ICON_PADDING: Record<BridgingFlowStep, string> = {
  bridgingInProgress: '10%',
  bridgingFailed: '18%',
  bridgingFinished: '18%',
  refundCompleted: '18%',
}

export const getStepColors = (
  theme: DefaultTheme,
): Record<BridgingFlowStep, { background: string; title: string; icon: string; iconBackground: string }> => ({
  bridgingInProgress: {
    background: theme.darkMode ? UI.COLOR_INFO_BG : UI.COLOR_BLUE_100_PRIMARY,
    title: UI.COLOR_BLUE_900_PRIMARY,
    icon: UI.COLOR_BLUE_500_PRIMARY,
    iconBackground: UI.COLOR_BLUE_200_PRIMARY,
  },
  bridgingFailed: {
    background: UI.COLOR_ALERT_BG,
    title: UI.COLOR_ALERT_TEXT,
    icon: UI.COLOR_ALERT_TEXT,
    iconBackground: UI.COLOR_ALERT_BG,
  },
  bridgingFinished: {
    background: UI.COLOR_SUCCESS_BG,
    title: UI.COLOR_SUCCESS_TEXT,
    icon: UI.COLOR_SUCCESS,
    iconBackground: UI.COLOR_SUCCESS_BG,
  },
  refundCompleted: {
    background: UI.COLOR_SUCCESS_BG,
    title: UI.COLOR_SUCCESS_TEXT,
    icon: UI.COLOR_SUCCESS,
    iconBackground: UI.COLOR_SUCCESS_BG,
  },
})

export const Header = styled.div<{ $step: BridgingFlowStep }>`
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  justify-content: center;
  gap: 20px;
  background: var(${({ $step, theme }) => getStepColors(theme)[$step].background});
  color: var(${({ $step, theme }) => getStepColors(theme)[$step].title});
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

const CONNECTOR_HEIGHT = '2px'
const MARGIN_MULTIPLIER = 1.5
const CONNECTOR_OFFSET_MULTIPLIER = -1.25

export const TokenLogo = styled(TokenLogoOriginal)<{ $step: BridgingFlowStep; $tokenSize: number }>`
  /* CSS custom properties for dynamic token sizing and spacing calculations */
  --size: ${({ $tokenSize }) => $tokenSize}px;
  --margin: calc(var(--size) * ${MARGIN_MULTIPLIER});
  --connector-offset: calc(var(--size) * ${CONNECTOR_OFFSET_MULTIPLIER});
  position: relative;

  /* Connector line between tokens using pseudo-element */
  &:before {
    content: '';
    display: block;
    width: var(--size);
    height: ${CONNECTOR_HEIGHT};
    background: var(${({ $step, theme }) => getStepColors(theme)[$step].iconBackground});
    position: absolute;

    ${Media.upToSmall()} {
      width: calc(var(--size) * 0.7);
    }
  }

  &:first-child {
    margin-right: var(--margin);

    ${Media.upToSmall()} {
      margin-right: calc(var(--margin) * 0.7);
    }

    &:before {
      right: var(--connector-offset);

      ${Media.upToSmall()} {
        right: calc(var(--connector-offset) * 0.7);
      }
    }
  }

  &:last-child {
    margin-left: var(--margin);

    ${Media.upToSmall()} {
      margin-left: calc(var(--margin) * 0.7);
    }

    &:before {
      left: var(--connector-offset);

      ${Media.upToSmall()} {
        left: calc(var(--connector-offset) * 0.7);
      }
    }
  }
`

export const StatusIcon = styled.div<{ $step: BridgingFlowStep }>`
  --iconSize: 80px;
  --iconSizeMobile: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(${({ $step, theme }) => getStepColors(theme)[$step].iconBackground});
  color: var(${({ $step, theme }) => getStepColors(theme)[$step].icon});
  border-radius: var(--iconSize);
  width: var(--iconSize);
  height: auto;
  max-height: var(--iconSize);
  max-width: var(--iconSize);
  min-width: var(--iconSize);
  min-height: var(--iconSize);

  ${Media.upToSmall()} {
    --iconSize: var(--iconSizeMobile);
  }

  > svg {
    width: 100%;
    height: 100%;
    padding: ${({ $step }) => STEP_ICON_PADDING[$step]};
    color: currentColor;
  }

  > svg > path {
    fill: currentColor;
  }
`
