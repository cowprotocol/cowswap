import { Color } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const EmptyState = styled.div`
  display: flex;
  justify-content: center;
  min-height: 25rem;
  padding: 3.2rem;
  font-size: 1.5rem;
`

export const EventLink = styled.span`
  max-width: 24rem;

  a {
    color: ${Color.explorer_textActive};
  }
`
