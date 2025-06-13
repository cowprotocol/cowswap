import { useAtomValue } from 'jotai'

import { UiOrderType } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useOrders } from 'legacy/state/orders/hooks'

import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { LimitOrdersWidget, useIsWidgetUnlocked, limitOrdersSettingsAtom } from 'modules/limitOrders'
import { OrdersTableWidget, TabOrderTypes } from 'modules/ordersTable'
import * as styledEl from 'modules/trade/pure/TradePageLayout'

const LIMIT_ORDERS_MAX_WIDTH = '1800px'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function RegularLimitOrders() {
  const isUnlocked = useIsWidgetUnlocked()
  const { chainId, account } = useWalletInfo()
  const allLimitOrders = useOrders(chainId, account, UiOrderType.LIMIT)
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
          <OrdersTableWidget orderType={TabOrderTypes.LIMIT} orders={allLimitOrders} />
        </styledEl.SecondaryWrapper>
      )}
    </styledEl.PageWrapper>
  )
}
