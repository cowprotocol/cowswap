import { useMemo } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { getAvailableChains } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

export function useAvailableChains(): SupportedChainId[] {
  const { isArbitrumOneEnabled } = useFeatureFlags()

  return useMemo(
    () => getAvailableChains(isArbitrumOneEnabled ? undefined : [SupportedChainId.ARBITRUM_ONE]),
    [isArbitrumOneEnabled]
  )
}
