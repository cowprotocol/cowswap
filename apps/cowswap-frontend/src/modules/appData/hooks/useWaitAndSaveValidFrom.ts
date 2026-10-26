import { useAtomValue } from 'jotai'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { isSolanaChain } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { cowBatchValidFromAtom, waitAndSaveEnabledAtom } from 'modules/trade'

/**
 * Batch `validFrom` for appData when Wait & Save is opted in.
 * Value comes from the shared scheduler (local time if quote skew is not ready yet).
 */
export function useWaitAndSaveValidFrom(): number | undefined {
  const { chainId } = useWalletInfo()
  const { isWaitForCowsEnabled } = useFeatureFlags()
  const isWaitAndSaveEnabled = useAtomValue(waitAndSaveEnabledAtom)
  const validFrom = useAtomValue(cowBatchValidFromAtom)
  const optedIn = Boolean(isWaitForCowsEnabled && isWaitAndSaveEnabled && !isSolanaChain(chainId))

  return optedIn ? validFrom : undefined
}
