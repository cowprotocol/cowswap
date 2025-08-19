import { doesHookHavePermit } from '@cowprotocol/hook-dapp-lib'

import { Order } from 'legacy/state/orders/actions'

import { getAppDataHooks } from 'modules/appData'

export function doesOrderHavePermit(order: Order): boolean {
  const appData = order.fullAppData
  const hooks = getAppDataHooks(appData)
  if (!hooks?.pre) return false

  return hooks.pre.filter((hook) => doesHookHavePermit(hook)).length > 0
}
