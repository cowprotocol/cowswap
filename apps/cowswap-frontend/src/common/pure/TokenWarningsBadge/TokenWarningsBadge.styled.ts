import { TokenWarningSeverity } from '@cowprotocol/tokens'
import { font, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

const SEVERITY_COLOR: Record<TokenWarningSeverity, UI> = {
  critical: UI.COLOR_DANGER_TEXT,
  warning: UI.COLOR_ALERT_TEXT,
  info: UI.COLOR_INFO_TEXT,
}

export const Badge = styled.button<{ severity: TokenWarningSeverity }>`
  ${font('FONT_SMALL', 'semibold')}
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  border: 0;
  background: none;
  cursor: help;
  color: ${({ severity }) => `var(${SEVERITY_COLOR[severity]})`};
  text-decoration: underline dotted;
  text-underline-offset: 3px;

  > svg {
    width: 14px;
    height: 14px;
  }
`

export const TooltipContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 280px;
`

export const TooltipTitle = styled.h3`
  ${font('FONT_NORMAL', 'semibold')}
  margin: 0;
`

export const WarningItem = styled.div<{ severity: TokenWarningSeverity }>`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-left: 10px;
  border-left: 2px solid ${({ severity }) => `var(${SEVERITY_COLOR[severity]})`};
`

export const WarningTitle = styled.span<{ severity: TokenWarningSeverity }>`
  ${font('FONT_SMALL', 'semibold')}
  color: ${({ severity }) => `var(${SEVERITY_COLOR[severity]})`};
`

export const WarningMessage = styled.span`
  ${font('FONT_SMALL')}
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`
