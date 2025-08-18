import { useMemo } from 'react'

import { areAddressesEqual, getIsNativeToken } from '@cowprotocol/common-utils'
import { Nullish } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Currency } from '@uniswap/sdk-core'

import { useOnlyPendingOrders } from 'legacy/state/orders/hooks'

import { doesOrderHavePermit } from '../utils/doesOrderHavePermit'

export function useHasPendingOrdersWithPermitForInputToken(
  currency: Nullish<Currency>,
  isPermitSupported?: boolean,
): boolean {
  const { chainId, account } = useWalletInfo()
  const pendingOrders = useOnlyPendingOrders(chainId, account)

  return useMemo(() => {
    if (isPermitSupported === false) return false
    if (currency && getIsNativeToken(currency)) return false

    return pendingOrders
      .map((order) => {
        if (!areAddressesEqual(currency?.address, order.sellToken)) return false
        return doesOrderHavePermit(order)
      })
      .some(Boolean)
  }, [pendingOrders, currency, isPermitSupported])
}
