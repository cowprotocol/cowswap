import { OrderKind } from '@cowprotocol/cow-sdk'
import { Nullish, UiOrderType } from '@cowprotocol/types'

import { TradeAmounts } from 'common/types'

export interface OrderNotificationInfo extends TradeAmounts {
  orderUid: string
  orderType: UiOrderType
  kind: OrderKind
  isEthFlowOrder: boolean
  owner: string
  receiver?: Nullish<string>
}
