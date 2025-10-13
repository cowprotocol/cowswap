import { doesHookHavePermit } from '@cowprotocol/hook-dapp-lib'

import { Order } from 'legacy/state/orders/actions'

import { getAppDataHooks } from 'modules/appData'

export function doesOrderHavePermit(order: Order): boolean {
  return !!getOrderPermitIfExists(order)
}

export function getOrderPermitIfExists(order: Order): string | null {
  const appData = order.fullAppData
  const hooks = getAppDataHooks(appData)
  if (!hooks?.pre) return null

  return hooks.pre.filter((hook) => doesHookHavePermit(hook))?.[0]?.callData || null
}
