import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export type BadgeTone = 'neutral' | 'info' | 'success' | 'error'

export const LinkedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  font-size: 14px;
`

export const ValidStatusBadge = styled(LinkedBadge)`
  color: var(${UI.COLOR_SUCCESS_TEXT});

  svg path {
    fill: var(${UI.COLOR_SUCCESS_TEXT});
  }
`

export const StatusText = styled.p<{ $variant: 'error' | 'success' }>`
  margin: 0 0 0 8px;
  font-size: 14px;
  color: ${({ $variant }) => ($variant === 'error' ? `var(${UI.COLOR_DANGER_TEXT})` : `var(${UI.COLOR_SUCCESS_TEXT})`)};
`
