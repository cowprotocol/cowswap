import { Badge, font } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { TwapTradeConfirmationDetails as TwapTradeConfirmationDetailsBase } from './TwapTradeConfirmationDetails'

export const TwapBadge = styled(Badge)`
  ${font('FONT_SMALL', 'semibold')}

  text-transform: none;
  margin-left: 8px;
`

export const TwapTradeConfirmationDetails = styled(TwapTradeConfirmationDetailsBase)`
  margin-top: -4px;
`
