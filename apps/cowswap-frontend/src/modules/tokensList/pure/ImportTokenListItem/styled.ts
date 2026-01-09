import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 20px;
  padding: 0 10px;
`

export const LoadedInfo = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
`

export const BlockedInfo = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: flex-start;
  color: var(${UI.COLOR_DANGER_TEXT});
  font-size: 13px;

  > svg {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
  }
`
