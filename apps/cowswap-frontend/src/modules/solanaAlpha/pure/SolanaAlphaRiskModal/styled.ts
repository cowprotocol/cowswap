import { UI } from '@cowprotocol/ui'

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
  gap: 16px;
  padding: 0 20px 20px;
`

export const NetworkBlock = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: var(${UI.COLOR_PAPER_DARKER});
  border-radius: 16px;
`

export const NetworkLogo = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 50%;
`

export const NetworkLabel = styled.span`
  font-size: 16px;
  font-weight: 600;
`

export const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;

  > button {
    width: 100%;
    min-height: 56px;
  }
`
