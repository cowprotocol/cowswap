import { useAtomValue } from 'jotai'
import { ReactNode, Suspense } from 'react'

import { Loading } from 'legacy/components/FlashingLoading'

import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { limitOrdersSettingsAtom, LimitOrdersWidget, useIsWidgetUnlocked } from 'modules/limitOrders'
import { LimitOrdersPermitUpdater, ordersTableStateAtom, OrdersTableWidget } from 'modules/ordersTable'
import * as styledEl from 'modules/trade/pure/TradePageLayout'

const LIMIT_ORDERS_MAX_WIDTH = '1800px'

export function RegularLimitOrdersPage(): ReactNode {
  const isUnlocked = useIsWidgetUnlocked()
  const { pendingOrders } = useAtomValue(ordersTableStateAtom)
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
        <styledEl.SecondaryWrapper className="trade-orders-table">
          {pendingOrders.length > 0 && <LimitOrdersPermitUpdater orders={pendingOrders} />}
          <Suspense fallback={<Loading />}>
            <OrdersTableWidget />
          </Suspense>
        </styledEl.SecondaryWrapper>
      )}
    </styledEl.PageWrapper>
  )
}
