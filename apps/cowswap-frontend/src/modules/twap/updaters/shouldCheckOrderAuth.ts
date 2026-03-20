import ms from 'ms.macro'

import { TWAP_PENDING_STATUSES } from '../const'
import { TwapOrderInfo, TwapOrderItem } from '../types'
import { isTwapOrderExpired } from '../utils/getTwapOrderStatus'

const AUTH_TIME_THRESHOLD = ms`1m`

export function shouldCheckOrderAuth(info: TwapOrderInfo, existingOrder: TwapOrderItem | undefined): boolean {
  const { isExecuted, confirmations, executionDate: _executionDate } = info.safeData.safeTxParams
  const executionDate = _executionDate ? new Date(_executionDate) : null

  if (isTwapOrderExpired(info.orderStruct, executionDate)) return false

  const isTxMined = isExecuted && confirmations > 0

  if (!isTxMined) return false

  if (!executionDate || Date.now() - executionDate.getTime() < AUTH_TIME_THRESHOLD) {
    return false
  }

  if (existingOrder) {
    return TWAP_PENDING_STATUSES.includes(existingOrder.status)
  }

  return true
}
