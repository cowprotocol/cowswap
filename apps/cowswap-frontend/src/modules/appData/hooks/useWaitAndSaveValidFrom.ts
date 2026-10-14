import { useAtomValue } from 'jotai'

import { useFeatureFlags } from '@cowprotocol/common-hooks'

import { useCowBatchValidFrom, waitAndSaveEnabledAtom } from 'modules/trade'

import { useLocalTimeOffset } from 'common/containers/InvalidLocalTimeWarning/localTimeOffsetState'

/**
 * Skew-corrected batch `validFrom` for appData when Wait & Save is on.
 * Omits the field until a quote-derived time offset exists (same gate as order validTo).
 */
export function useWaitAndSaveValidFrom(): number | undefined {
  const { isWaitForCowsEnabled } = useFeatureFlags()
  const isWaitAndSaveEnabled = useAtomValue(waitAndSaveEnabledAtom)
  const timeOffset = useLocalTimeOffset()
  const enabled = Boolean(isWaitForCowsEnabled && isWaitAndSaveEnabled && timeOffset !== undefined)

  return useCowBatchValidFrom(enabled)
}
