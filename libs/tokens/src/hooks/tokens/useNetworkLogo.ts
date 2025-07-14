import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { useIsBridgingEnabled, useTheme } from '@cowprotocol/common-hooks'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { environmentAtom } from '../../state/environmentAtom'

export function useNetworkLogo(chainId?: number): string | undefined {
  const { bridgeNetworkInfo } = useAtomValue(environmentAtom)
  const theme = useTheme()
  const isBridgingEnabled = useIsBridgingEnabled()

  const baseNetworkInfo: string | undefined = useMemo(() => {
    if (!chainId) {
      return undefined
    }

    const chainInfo = getChainInfo(chainId)

    // Always use light (blue) logo for Arbitrum to ensure visibility against white backgrounds
    if (chainId === SupportedChainId.ARBITRUM_ONE) {
      return chainInfo.logo.light
    }

    return theme.darkMode ? chainInfo?.logo?.dark : chainInfo?.logo?.light
  }, [chainId, theme.darkMode])

  if (!chainId || !isBridgingEnabled) return undefined

  if (baseNetworkInfo) return baseNetworkInfo

  const bridgeNetworkLogo = bridgeNetworkInfo?.find((network) => network.id === chainId)?.logo

  return bridgeNetworkLogo ? (theme.darkMode ? bridgeNetworkLogo.dark : bridgeNetworkLogo.light) : undefined
}
