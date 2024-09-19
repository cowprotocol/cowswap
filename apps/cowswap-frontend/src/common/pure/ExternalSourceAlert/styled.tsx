import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

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

  h3 {
    text-align: center;
    margin: 18px 0;
  }
`

export const AcceptanceBox = styled.label`
  display: flex;
  gap: 6px;
  cursor: pointer;
  margin-top: 16px;
`
