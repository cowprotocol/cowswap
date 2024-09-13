import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const ClaimableAmountContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  background-color: var(${UI.COLOR_BACKGROUND});

  padding: 0.75rem;
  margin-top: 1rem;
  margin-bottom: 1rem;
  border-radius: 0.75rem;

  span {
    font-weight: 600;
  }
`
