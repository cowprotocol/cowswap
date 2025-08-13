import { useMemo } from 'react'

import { areAddressesEqual, getIsNativeToken } from '@cowprotocol/common-utils'
import { Nullish } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Currency } from '@uniswap/sdk-core'

import { useOnlyPendingOrders } from '../../legacy/state/orders/hooks'
import { getAppDataHooks } from '../../modules/appData'

const DAI_LIKE_SELECTOR = '8fcbaf0c'
const EIP2612_SELECTOR = 'd505accf'

export function useHasPendingOrdersWithPermitForInputToken(
  currency: Nullish<Currency>,
  isPermitSupported?: boolean,
): boolean {
  const { chainId, account } = useWalletInfo()
  const pendingOrders = useOnlyPendingOrders(chainId, account)

  return useMemo(() => {
    if (typeof isPermitSupported === 'boolean' && !isPermitSupported) return false
    if (currency && getIsNativeToken(currency)) return false

    return pendingOrders
      .map((order) => {
        if (!areAddressesEqual(currency?.address, order.sellToken)) return false

        const appData = order.fullAppData
        const hooks = getAppDataHooks(appData)
        if (!hooks?.pre) return false

        return hooks.pre.filter((hook) => hasPermitSelector(hook.callData)).length > 0
      })
      .some(Boolean)
  }, [pendingOrders, currency, isPermitSupported])
}

function hasPermitSelector(calldata: string): boolean {
  calldata = calldata.toLowerCase()
  if (calldata.includes(EIP2612_SELECTOR)) return true
  return calldata.includes(DAI_LIKE_SELECTOR)
}
