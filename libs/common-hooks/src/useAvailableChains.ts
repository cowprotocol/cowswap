import { useMemo } from 'react'

import { getAvailableChains } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useFeatureFlags } from './index'

export function useAvailableChains(): SupportedChainId[] {
  const { isArbitrumOneEnabled } = useFeatureFlags()

  return useMemo(
    () => getAvailableChains(isArbitrumOneEnabled ? undefined : [SupportedChainId.ARBITRUM_ONE]),
    [isArbitrumOneEnabled]
  )
}
