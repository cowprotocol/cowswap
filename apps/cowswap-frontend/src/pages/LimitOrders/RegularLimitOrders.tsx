import { useAtomValue } from 'jotai'

import { UiOrderType } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useOrders } from 'legacy/state/orders/hooks'

import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { LimitOrdersWidget, useIsWidgetUnlocked } from 'modules/limitOrders'
import { OrdersTableWidget, TabOrderTypes } from 'modules/ordersTable'
import * as styledEl from 'modules/trade/pure/TradePageLayout'

import { SHOW_LIMIT_ORDERS_PROMO } from 'common/constants/featureFlags'
import { limitOrdersPromoDismissedAtom } from 'common/state/limitOrdersPromoAtom'

export function RegularLimitOrders() {
  const isWidgetUnlocked = useIsWidgetUnlocked()
  const isDismissed = useAtomValue(limitOrdersPromoDismissedAtom)
  const shouldShowPromo = SHOW_LIMIT_ORDERS_PROMO && !isDismissed
  const isUnlocked = isWidgetUnlocked || SHOW_LIMIT_ORDERS_PROMO
  const { chainId, account } = useWalletInfo()
  const allLimitOrders = useOrders(chainId, account, UiOrderType.LIMIT)
  const { hideOrdersTable } = useInjectedWidgetParams()

  return (
    <styledEl.PageWrapper isUnlocked={isUnlocked && (!shouldShowPromo || isDismissed)}>
      <styledEl.PrimaryWrapper>
        <LimitOrdersWidget />
      </styledEl.PrimaryWrapper>

      <styledEl.SecondaryWrapper>
        {!hideOrdersTable && !shouldShowPromo && (
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
