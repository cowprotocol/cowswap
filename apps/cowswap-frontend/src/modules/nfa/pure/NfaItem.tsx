import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const NfaItem = styled.div`
  display: grid;
  grid-template-columns: 32px 1fr;
  gap: 20px;
  align-items: center;
  background-color: var(${UI.COLOR_PAPER_DARKER});
  padding: 12px;
  border-radius: 8px;
  min-height: 60px;
`
