import { useAtomValue } from 'jotai'

import { canonicalBatchScheduleAtom, useIsWaitAndSaveAvailable, waitAndSaveEnabledAtom } from 'modules/trade'

export interface WaitAndSaveBatchData {
  nextBatch: number
  /** Earliest signed `validTo` that still clears the next canonical batch, including a skipped one and accounting for min validity. */
  nextBatchValidTo: number
}

/**
 * Schedule anchors for `validTo` when Wait & Save is opted in.
 * App-data carries `enableWaitForCow`; it does not carry `validFrom`.
 */
export function useWaitAndSaveBatchData(): WaitAndSaveBatchData | undefined {
  const isWaitAndSaveAvailable = useIsWaitAndSaveAvailable()
  const isWaitAndSaveEnabled = useAtomValue(waitAndSaveEnabledAtom)
  const schedule = useAtomValue(canonicalBatchScheduleAtom)
  const optedIn = isWaitAndSaveAvailable && isWaitAndSaveEnabled

  if (!optedIn || !schedule) {
    return undefined
  }

  return {
    nextBatch: schedule.nextBatch,
    nextBatchValidTo: schedule.nextBatchValidTo,
  }
}
