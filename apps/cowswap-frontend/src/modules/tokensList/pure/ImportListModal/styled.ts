import { Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { ExternalSourceAlert } from 'common/pure/ExternalSourceAlert'

export const Wrapper = styled.div`
  display: block;
  width: 100%;
  overflow: auto;
  background: var(${UI.COLOR_PAPER});
  border-radius: 20px;
`

export const ActionButtonWrapper = styled.div`
  padding: 0 20px 20px 20px;
`

export const ListInfo = styled.div`
  display: flex;
  flex-direction: row;
  margin: 20px;
  gap: 20px;
  padding: 0 10px;
`

export const ListTitle = styled.div`
  font-weight: 600;
  font-size: 18px;

  ${Media.upToSmall()} {
    word-break: break-all;
  }
`

export const ListLink = styled.a`
  font-size: 14px;

  ${Media.upToSmall()} {
    word-break: break-all;
  }
`

export const ExternalSourceAlertStyled = styled(ExternalSourceAlert)`
  margin: 0 20px 20px 20px;
`

export const BlockedWarning = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  background: var(${UI.COLOR_DANGER_BG});
  color: var(${UI.COLOR_DANGER_TEXT});
  border-radius: 10px;
  font-size: 14px;
  padding: 16px 20px;
  margin: 0 20px 20px 20px;
`
