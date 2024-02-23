import { useEffect } from 'react'

import { triggerAppziSurvey } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useOnlyPendingOrders } from 'legacy/state/orders/hooks'

/**
 * Updater for triggering Appzi Limit Orders survey
 *
 * Should trigger only when there are pending orders on load
 * Not a problem if triggered more than once. Appzi controls the form display rules
 */
export function TriggerAppziLimitOrdersSurveyUpdater(): null {
  const { account, chainId } = useWalletInfo()
  const orders = useOnlyPendingOrders(chainId)
  const pendingOrderIds = orders.map(({ id }) => id).join(',')

  useEffect(() => {
    if (account && chainId && pendingOrderIds) {
      triggerAppziSurvey({ account, chainId, pendingOrderIds, openedLimitPage: true }, 'limit')
    }
  }, [account, chainId, pendingOrderIds])

  return null
}
