import { Color } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const TradeTypeWrapper = styled.div`
  span {
    &.long {
      color: ${Color.explorer_green1};
    }
    &.short {
      color: ${Color.explorer_red1};
    }
  }
`
