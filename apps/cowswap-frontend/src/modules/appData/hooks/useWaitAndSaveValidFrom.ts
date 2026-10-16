import { useAtomValue } from 'jotai'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { isSolanaChain } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useCowBatchValidFrom, waitAndSaveEnabledAtom } from 'modules/trade'

import { useLocalTimeOffset } from 'common/containers/InvalidLocalTimeWarning/localTimeOffsetState'

/**
 * Skew-corrected batch `validFrom` for appData when Wait & Save is on.
 * Omits the field until a quote-derived time offset exists (same gate as order validTo).
 */
export function useWaitAndSaveValidFrom(): number | undefined {
  const { chainId } = useWalletInfo()
  const { isWaitForCowsEnabled } = useFeatureFlags()
  const isWaitAndSaveEnabled = useAtomValue(waitAndSaveEnabledAtom)
  const timeOffset = useLocalTimeOffset()
  const enabled = Boolean(
    isWaitForCowsEnabled && isWaitAndSaveEnabled && timeOffset !== undefined && !isSolanaChain(chainId),
  )

  return useCowBatchValidFrom(enabled)
}
