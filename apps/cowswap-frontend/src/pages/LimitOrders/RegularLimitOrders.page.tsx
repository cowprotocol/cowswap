import { useAtomValue } from 'jotai'
import { ReactNode, Suspense } from 'react'

import { useInjectedWidgetParams } from 'entities/injectedWidget'

import { Loading } from 'legacy/components/FlashingLoading'

import { limitOrdersSettingsAtom, LimitOrdersWidget, useIsWidgetUnlocked } from 'modules/limitOrders'
import { LimitOrdersPermitUpdater, ordersTableStateAtom, OrdersTableWidget, useOrdersTable } from 'modules/ordersTable'
import * as styledEl from 'modules/trade/pure/TradePageLayout'

import { TabOrderTypes } from 'common/state/routesState'

const LIMIT_ORDERS_MAX_WIDTH = '1800px'

export function RegularLimitOrdersPage(): ReactNode {
  useOrdersTable(TabOrderTypes.LIMIT)

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
            <OrdersTableWidget orderType={TabOrderTypes.LIMIT} />
          </Suspense>
        </styledEl.SecondaryWrapper>
      )}
    </styledEl.PageWrapper>
  )
}
