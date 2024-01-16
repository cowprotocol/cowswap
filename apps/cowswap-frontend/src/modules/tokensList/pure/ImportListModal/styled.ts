import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  display: block;
  width: 100%;
  overflow: auto;
  background: var(${UI.COLOR_PAPER});
  border-radius: 20px;
`

export const Contents = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 5px;
  padding: 20px;
  margin: 20px;
  border-radius: 20px;
  color: var(${UI.COLOR_DANGER_TEXT});
  background: var(${UI.COLOR_DANGER_BG});
`

export const ActionButtonWrapper = styled.div`
  padding: 0 20px 20px 20px;
`

export const AcceptanceBox = styled.label`
  display: flex;
  gap: 6px;
  cursor: pointer;
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
`

export const ListLink = styled.a`
  font-size: 14px;
`
