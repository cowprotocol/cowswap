import { useAtomValue } from 'jotai'

import { canonicalBatchScheduleAtom, useIsWaitAndSaveAvailable, waitAndSaveEnabledAtom } from 'modules/trade'

/**
 * Whether signed appData should set `metadata.enableWaitForCow` for market orders.
 * False until a canonical batch schedule is loaded, so the marker is not signed without `nextBatchValidTo`.
 */
export function useEnableWaitForCow(): boolean {
  const isWaitAndSaveAvailable = useIsWaitAndSaveAvailable()
  const isWaitAndSaveEnabled = useAtomValue(waitAndSaveEnabledAtom)
  const schedule = useAtomValue(canonicalBatchScheduleAtom)

  return isWaitAndSaveAvailable && isWaitAndSaveEnabled && !!schedule
}
