import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const TabsContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 12px;
  margin: 0 20px 15px 20px;

`
export const TabButton = styled.button<{ active$: boolean }>`
  cursor: pointer;
  border: 1px solid var(${UI.COLOR_BACKGROUND});
  outline: none;
  padding: 8px 16px;
  border-radius: 32px;
  font-size: 13px;
  font-weight: 600;
  color: var(${UI.COLOR_TEXT});
  background: ${({ active$ }) => active$ ? `var(${UI.COLOR_BACKGROUND})` : 'transparent'};

  &:hover {
    background : var(${UI.COLOR_BACKGROUND});
  }
`
