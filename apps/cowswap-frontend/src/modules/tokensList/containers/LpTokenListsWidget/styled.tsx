import { Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const TabsContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  margin: 0 20px 20px;

  ${Media.upToSmall()} {
    gap: 4px;
  }
`
export const TabButton = styled.button<{ active$: boolean; isCowAmm?: boolean }>`
  cursor: pointer;
  border: 1px solid var(${UI.COLOR_BACKGROUND});
  outline: none;
  padding: 8px 16px;
  border-radius: 32px;
  font-size: 14px;
  font-weight: ${({ active$ }) => (active$ ? '600' : '500')};
  color: ${({ active$ }) => (active$ ? `var(${UI.COLOR_TEXT})` : `var(${UI.COLOR_TEXT_OPACITY_70})`)};
  background: ${({ active$ }) => (active$ ? `var(${UI.COLOR_BACKGROUND})` : 'transparent')};
  display: flex;
  align-items: center;
  gap: 4px;

  ${Media.upToSmall()} {
    padding: 8px 12px;
    font-size: 13px;
  }

  &:hover {
    background: var(${UI.COLOR_BACKGROUND});
  }
`
