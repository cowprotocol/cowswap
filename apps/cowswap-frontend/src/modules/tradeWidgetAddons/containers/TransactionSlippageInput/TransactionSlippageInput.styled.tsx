import { FancyButton, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const AutoButton = styled(FancyButton)<{ active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(${({ active }) => (active ? UI.COLOR_PRIMARY : UI.COLOR_PRIMARY_OPACITY_50)});
  transition: background-color 0.2s;
  height: auto;
  margin: 4px 0 4px 4px;
  border-radius: 12px; // 16px from parent - 4px for margin
  min-width: 0;
  padding: 0 8px;
  font-size: 14px;
  font-weight: 400;

  :hover {
    cursor: pointer;
    background: var(${UI.COLOR_PRIMARY});
  }

  &:disabled {
    border: none;
    pointer-events: none;
  }
`
