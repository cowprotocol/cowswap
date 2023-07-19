import { useAtomValue } from 'jotai/utils'
import { useMemo } from 'react'

import { OrderClass } from '@cowprotocol/cow-sdk'

import { useOrders } from 'legacy/state/orders/hooks'

import { AppDataUpdater } from 'modules/appData'
import {
  LimitOrdersWidget,
  QuoteObserverUpdater,
  InitialPriceUpdater,
  ExecutionPriceUpdater,
  limitOrdersRawStateAtom,
  LIMIT_ORDER_SLIPPAGE,
} from 'modules/limitOrders'
import { OrdersTableWidget } from 'modules/ordersTable'
import { TabOrderTypes } from 'modules/ordersTable/pure/OrdersTableContainer'
import * as styledEl from 'modules/trade/pure/TradePageLayout'
import { useWalletInfo } from 'modules/wallet'

import { getIsNotComposableCowOrder } from 'utils/orderUtils/getIsNotComposableCowOrder'

export default function LimitOrderPage() {
  const { chainId, account } = useWalletInfo()
  const { isUnlocked } = useAtomValue(limitOrdersRawStateAtom)
  const allLimitOrders = useOrders(chainId, account, OrderClass.LIMIT)
  const onlyPlainLimitOrders = useMemo(() => allLimitOrders.filter(getIsNotComposableCowOrder), [allLimitOrders])

  return (
    <>
      <AppDataUpdater orderClass="limit" slippage={LIMIT_ORDER_SLIPPAGE} />
      <QuoteObserverUpdater />
      <InitialPriceUpdater />
      <ExecutionPriceUpdater />
      <styledEl.PageWrapper isUnlocked={isUnlocked}>
        <styledEl.PrimaryWrapper>
          <LimitOrdersWidget />
        </styledEl.PrimaryWrapper>

        <styledEl.SecondaryWrapper>
          <OrdersTableWidget orderType={TabOrderTypes.LIMIT} orders={onlyPlainLimitOrders} />
        </styledEl.SecondaryWrapper>
      </styledEl.PageWrapper>
    </>
  )
}
