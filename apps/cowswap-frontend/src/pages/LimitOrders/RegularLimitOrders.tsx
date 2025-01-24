import { UiOrderType } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useOrders } from 'legacy/state/orders/hooks'

import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { LimitOrdersWidget, useIsWidgetUnlocked } from 'modules/limitOrders'
import { OrdersTableWidget, TabOrderTypes } from 'modules/ordersTable'
import * as styledEl from 'modules/trade/pure/TradePageLayout'

export function RegularLimitOrders() {
  const isUnlocked = useIsWidgetUnlocked()
  const { chainId, account } = useWalletInfo()
  const allLimitOrders = useOrders(chainId, account, UiOrderType.LIMIT)
  const { hideOrdersTable } = useInjectedWidgetParams()

  return (
    <styledEl.PageWrapper isUnlocked={isUnlocked}>
      <styledEl.PrimaryWrapper>
        <LimitOrdersWidget />
      </styledEl.PrimaryWrapper>

      <styledEl.SecondaryWrapper>
        {!hideOrdersTable && (
          <OrdersTableWidget
            displayOrdersOnlyForSafeApp={false}
            orderType={TabOrderTypes.LIMIT}
            orders={allLimitOrders}
          />
        )}
      </styledEl.SecondaryWrapper>
    </styledEl.PageWrapper>
  )
}
