import { TokenName, TokenSymbol, UI } from '@cowprotocol/ui'

import { AlertCircle } from 'react-feather'
import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  display: block;
  width: 100%;
  background: var(${UI.COLOR_PAPER});
  border-radius: 20px;
  overflow: auto;
`

export const Contents = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 20px;
  padding: 20px;
`

export const AlertIcon = styled(AlertCircle)`
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
