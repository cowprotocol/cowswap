import { useAtomValue } from 'jotai'

import { canonicalBatchScheduleAtom, useIsWaitAndSaveAvailable, waitAndSaveEnabledAtom } from 'modules/trade'

/**
 * Schedule anchors for `validTo` when Wait & Save is opted in.
 * App-data carries `enableWaitForCow`; it does not carry `validFrom`.
 */
export function useWaitAndSaveValidTo(): { nextBatch: number; nextBatchValidTo: number } | undefined {
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
