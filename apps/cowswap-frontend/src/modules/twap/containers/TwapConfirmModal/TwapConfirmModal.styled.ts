import { Badge, font } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { OrderStepTokenInfo } from 'modules/trade/pure/OrderSteps/token-info/OrderStepTokenInfo.pure'

import { TwapTradeConfirmationDetails as TwapTradeConfirmationDetailsBase } from './TwapTradeConfirmationDetails'

export const TwapBadge = styled(Badge)`
  ${font('FONT_SMALL', 'semibold')}

  text-transform: none;
  margin-left: 8px;
`

export const TwapTradeConfirmationDetails = styled(TwapTradeConfirmationDetailsBase)`
  margin-top: -4px;
`

export const TwapOrderStepTokenInfo = styled(OrderStepTokenInfo)`
  margin-top: 10px;
`
