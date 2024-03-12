import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { Toggle } from 'legacy/components/Toggle'

export const SwapSettings = styled.div`
  display: flex;
  gap: 8px;
`

export const NFAButton = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  margin-right: 10px;
  border: 1px solid var(${UI.COLOR_PAPER_DARKEST});
  border-radius: 12px;
  padding: 4px 10px;
`

export const NFAToggle = styled(Toggle)<{ isActive: boolean }>`
  height: 12px;
  padding: 0;
  width: 28px;

  > span {
    width: 16px;
    height: 16px;
    margin-right: 0;
    margin-left: ${({ isActive }) => (isActive ? '12px' : '0px')};
  }
`
