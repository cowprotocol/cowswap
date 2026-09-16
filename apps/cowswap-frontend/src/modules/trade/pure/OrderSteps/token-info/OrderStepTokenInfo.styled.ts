import { ExternalLink, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const TokenInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 400;
  line-height: 16px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});

  > div:first-child {
    border-radius: 100%;
  }
`

export const TokenInfoLink = styled(ExternalLink)`
  color: inherit;
  font-weight: inherit;
`
