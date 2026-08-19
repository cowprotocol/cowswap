import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 6px 12px;
  width: 100%;
`

export const Chip = styled.button<{ selected$?: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  font-size: 12px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  opacity: ${({ selected$ }) => (selected$ ? 0.5 : 1)};

  &:hover {
    color: var(${UI.COLOR_TEXT});
  }

  img {
    width: 14px;
    height: 14px;
    border-radius: 50%;
  }
`
