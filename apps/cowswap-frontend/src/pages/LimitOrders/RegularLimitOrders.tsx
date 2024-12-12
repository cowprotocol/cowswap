import { useAtomValue } from 'jotai'

import { UiOrderType } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useOrders } from 'legacy/state/orders/hooks'

import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { LimitOrdersWidget, useIsWidgetUnlocked, limitOrdersSettingsAtom } from 'modules/limitOrders'
import { OrdersTableWidget, TabOrderTypes } from 'modules/ordersTable'
import * as styledEl from 'modules/trade/pure/TradePageLayout'

export function RegularLimitOrders() {
  const isUnlocked = useIsWidgetUnlocked()
  const { chainId, account } = useWalletInfo()
  const allLimitOrders = useOrders(chainId, account, UiOrderType.LIMIT)
  const { hideOrdersTable } = useInjectedWidgetParams()
  const { ordersTableOnLeft } = useAtomValue(limitOrdersSettingsAtom)

  return (
    <styledEl.PageWrapper isUnlocked={isUnlocked} secondaryOnLeft={ordersTableOnLeft}>
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
