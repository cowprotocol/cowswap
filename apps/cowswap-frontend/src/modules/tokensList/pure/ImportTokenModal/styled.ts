import { TokenName, TokenSymbol, UI } from '@cowprotocol/ui'

import { AlertTriangle } from 'react-feather'
import styled from 'styled-components/macro'

import { TokenRiskDetails } from 'common/pure/TokenRisk'

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: 100%;
  background: var(${UI.COLOR_PAPER});
  border-radius: 20px;
  overflow: hidden;
`

export const Contents = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 20px;
  padding: 20px;
  overflow-x: hidden;
  overflow-y: auto;
`

/* The acknowledgement must stay reachable without scrolling the risk list to its end. */
export const StickyFooter = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 20px 20px;
  border-top: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
  background: var(${UI.COLOR_PAPER});
  box-shadow: 0 -4px 12px rgb(0 0 0 / 6%);
`

export const RiskPanel = styled(TokenRiskDetails)`
  padding: 0;
  text-align: left;
  background: transparent;
`

export const AlertIcon = styled(AlertTriangle)`
  color: var(${UI.COLOR_RED});
  margin-top: 20px;
`

export const TokenInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;
  font-size: 14px;
  margin-bottom: 20px;
  max-width: 100%;

  > a {
    word-break: break-all;
  }

  &:last-child {
    margin-bottom: 0;
  }
`

export const StyledTokenSymbol = styled(TokenSymbol)`
  font-weight: 600;
  font-size: 20px;
`

export const StyledTokenName = styled(TokenName)`
  color: inherit;
  opacity: 0.6;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    opacity: 1;
  }
`

export const UnknownSourceWarning = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  background: var(${UI.COLOR_DANGER_BG});
  color: var(${UI.COLOR_DANGER_TEXT});
  border-radius: 10px;
  font-size: 13px;
  padding: 6px 12px;
`
