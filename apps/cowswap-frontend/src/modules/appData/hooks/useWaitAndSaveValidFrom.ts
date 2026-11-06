import { useAtomValue } from 'jotai'

import { cowBatchValidFromAtom, useIsWaitAndSaveAvailable, waitAndSaveEnabledAtom } from 'modules/trade'

/**
 * Batch `validFrom` for appData when Wait & Save is opted in.
 * Value comes from the shared scheduler (local time if quote skew is not ready yet).
 */
export function useWaitAndSaveValidFrom(): number | undefined {
  const isWaitAndSaveAvailable = useIsWaitAndSaveAvailable()
  const isWaitAndSaveEnabled = useAtomValue(waitAndSaveEnabledAtom)
  const validFrom = useAtomValue(cowBatchValidFromAtom)
  const optedIn = isWaitAndSaveAvailable && isWaitAndSaveEnabled

  return optedIn ? validFrom : undefined
}
