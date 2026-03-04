import { InlineBanner } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const StatusMessage = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

export const Footer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 10px 10px;
`

export const InlineAlert = styled(InlineBanner)`
  border-radius: 9px;
  padding: 12px 16px;
  text-align: center;
`
