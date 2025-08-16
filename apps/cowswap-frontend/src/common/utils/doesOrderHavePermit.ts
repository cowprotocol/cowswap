import { Order } from 'legacy/state/orders/actions'

import { getAppDataHooks } from 'modules/appData'

const DAI_LIKE_SELECTOR = '8fcbaf0c'
const EIP2612_SELECTOR = 'd505accf'

export function doesOrderHavePermit(order: Order): boolean {
  const appData = order.fullAppData
  const hooks = getAppDataHooks(appData)
  if (!hooks?.pre) return false

  return hooks.pre.filter((hook) => hasPermitSelector(hook.callData)).length > 0
}

function hasPermitSelector(calldata: string): boolean {
  calldata = calldata.toLowerCase()
  if (calldata.includes(EIP2612_SELECTOR)) return true
  return calldata.includes(DAI_LIKE_SELECTOR)
}
