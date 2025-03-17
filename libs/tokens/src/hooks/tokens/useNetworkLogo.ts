import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { useFeatureFlags, useTheme } from '@cowprotocol/common-hooks'

import { environmentAtom } from '../../state/environmentAtom'

export function useNetworkLogo(chainId?: number) {
  const { bridgeNetworkInfo } = useAtomValue(environmentAtom)
  const theme = useTheme()
  const { isBridgingEnabled } = useFeatureFlags()
  
  const baseNetworkInfo: string | undefined = useMemo(() => {
    if (!chainId) {
      return undefined
    }

    return getChainInfo(chainId).logo.light
  }, [chainId])

  if (!chainId || !isBridgingEnabled) return undefined

  if (baseNetworkInfo) return baseNetworkInfo

  const bridgeNetworkLogo = bridgeNetworkInfo?.find((network) => network.id === chainId)?.logoUrl

  return bridgeNetworkLogo ? (theme.darkMode ? bridgeNetworkLogo.dark : bridgeNetworkLogo.light) : undefined
}
