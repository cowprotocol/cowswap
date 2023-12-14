import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const ListInfo = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: inherit;
`

export const ListName = styled.div`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 5px;
  color: inherit;
`

export const TokensInfo = styled.div`
  display: flex;
  gap: 5px;
  color: inherit;
  opacity: 0.6;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    opacity: 1;
  }
`
