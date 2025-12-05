import { Media } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const isMobileQuery = Media.upToMedium

export const HideMobile = styled.div`
  ${isMobileQuery(true)} {
    display: none;
  }
`
