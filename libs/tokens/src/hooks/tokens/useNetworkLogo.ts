import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { useIsBridgingEnabled, useTheme } from '@cowprotocol/common-hooks'

import { environmentAtom } from '../../state/environmentAtom'

export function useNetworkLogo(chainId?: number): string | undefined {
  const { bridgeNetworkInfo } = useAtomValue(environmentAtom)
  const { darkMode } = useTheme()
  const isBridgingEnabled = useIsBridgingEnabled()

  const baseNetworkInfo: string | undefined = useMemo(() => {
    if (!chainId) {
      return undefined
    }

    const chainInfo = getChainInfo(chainId)

    return darkMode ? chainInfo?.logo?.dark : chainInfo?.logo?.light
  }, [chainId, darkMode])

  if (!chainId || !isBridgingEnabled) return undefined

  if (baseNetworkInfo) return baseNetworkInfo

  const bridgeNetworkLogo = bridgeNetworkInfo?.find((network) => network.id === chainId)?.logo

  return bridgeNetworkLogo ? (darkMode ? bridgeNetworkLogo.dark : bridgeNetworkLogo.light) : undefined
}
