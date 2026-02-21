import { useAtomValue } from 'jotai'
import { ReactNode, Suspense, useMemo } from 'react'

import { UiOrderType } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Loading } from 'legacy/components/FlashingLoading'
import { OrderStatus } from 'legacy/state/orders/actions'
import { useOrders } from 'legacy/state/orders/hooks'

import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { limitOrdersSettingsAtom, LimitOrdersWidget, useIsWidgetUnlocked } from 'modules/limitOrders'
import { LimitOrdersPermitUpdater, OrdersTableWidget } from 'modules/ordersTable'
import * as styledEl from 'modules/trade/pure/TradePageLayout'

const LIMIT_ORDERS_MAX_WIDTH = '1800px'

export function RegularLimitOrdersPage(): ReactNode {
  const isUnlocked = useIsWidgetUnlocked()
  const { chainId, account } = useWalletInfo()
  const allLimitOrders = useOrders(chainId, account, UiOrderType.LIMIT)
  const pendingLimitOrders = useMemo(
    () => allLimitOrders.filter((order) => order.status === OrderStatus.PENDING),
    [allLimitOrders],
  )
  const { hideOrdersTable } = useInjectedWidgetParams()
  const { ordersTableOnLeft } = useAtomValue(limitOrdersSettingsAtom)

  return (
    <styledEl.PageWrapper
      isUnlocked={isUnlocked}
      secondaryOnLeft={ordersTableOnLeft}
      maxWidth={LIMIT_ORDERS_MAX_WIDTH}
      hideOrdersTable={hideOrdersTable}
    >
      <styledEl.PrimaryWrapper>
        <LimitOrdersWidget />
      </styledEl.PrimaryWrapper>

      {!hideOrdersTable && (
        <styledEl.SecondaryWrapper>
          {pendingLimitOrders.length > 0 && <LimitOrdersPermitUpdater orders={pendingLimitOrders} />}
          <Suspense fallback={<Loading />}>
            <OrdersTableWidget /* orders={allLimitOrders} */ />
          </Suspense>
        </styledEl.SecondaryWrapper>
      )}
    </styledEl.PageWrapper>
  )
}
