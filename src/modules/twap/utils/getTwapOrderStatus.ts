import { TWAPOrderStatus, TWAPOrderStruct } from '../types'

export function getTwapOrderStatus(
  order: TWAPOrderStruct,
  isExecuted: boolean,
  auth: boolean | undefined
): TWAPOrderStatus {
  if (!isExecuted) return TWAPOrderStatus.WaitSigning

  const { t0: startTime, n: numOfParts, t: timeInterval } = order
  const endTime = startTime + timeInterval * numOfParts
  const nowTimestamp = Math.ceil(Date.now() / 1000)

  if (nowTimestamp > endTime) return TWAPOrderStatus.Expired

  if (!auth) return TWAPOrderStatus.Cancelled

  return TWAPOrderStatus.Scheduled
}
