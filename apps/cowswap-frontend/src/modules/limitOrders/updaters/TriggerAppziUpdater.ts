import { useEffect, useMemo } from 'react'

import { UiOrderType } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { triggerAppziSurvey } from 'appzi'

import { useOnlyPendingOrders } from 'legacy/state/orders/hooks'

import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'

/**
 * Updater for triggering Appzi Limit Orders survey
 *
 * Should trigger only when there are pending orders on load
 * Not a problem if triggered more than once. Appzi controls the form display rules
 */
export function TriggerAppziLimitOrdersSurveyUpdater(): null {
  const { account, chainId } = useWalletInfo()
  const orders = useOnlyPendingOrders(chainId)

  const pendingOrderIds = useMemo(() => {
    return orders
      .reduce<string[]>((acc, order) => {
        if (getUiOrderType(order) === UiOrderType.LIMIT) {
          acc.push(order.id)
        }

        return acc
      }, [])
      .join(',')
  }, [orders])

  useEffect(() => {
    if (account && chainId && pendingOrderIds) {
      triggerAppziSurvey({ account, chainId, pendingOrderIds, openedLimitPage: true }, 'limit')
    }
  }, [account, chainId, pendingOrderIds])

  return null
}
