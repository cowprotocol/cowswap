import { TokenSymbol } from '@cowprotocol/ui'

import { AlertCircle } from 'react-feather'
import styled from 'styled-components/macro'

import { UI } from 'common/constants/theme'

export const Wrapper = styled.div`
  display: block;
  width: 100%;
  background: var(${UI.COLOR_CONTAINER_BG_01});
  border-radius: 20px;
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
`

export const StyledTokenSymbol = styled(TokenSymbol)`
  font-weight: 600;
  font-size: 20px;
`

export const TokenName = styled.div`
  color: var(${UI.COLOR_LINK});
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
