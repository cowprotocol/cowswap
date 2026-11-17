import { useAtomValue } from 'jotai'

import { useIsWaitAndSaveAvailable, waitAndSaveEnabledAtom } from 'modules/trade'

/**
 * Whether signed appData should set `metadata.enableWaitForCow` for market orders.
 */
export function useEnableWaitForCow(): boolean {
  const isWaitAndSaveAvailable = useIsWaitAndSaveAvailable()
  const isWaitAndSaveEnabled = useAtomValue(waitAndSaveEnabledAtom)

  return isWaitAndSaveAvailable && isWaitAndSaveEnabled
}
