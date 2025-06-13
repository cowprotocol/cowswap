import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { useIsBridgingEnabled, useTheme } from '@cowprotocol/common-hooks'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useIsSmartContractWallet } from '@cowprotocol/wallet'

import { environmentAtom } from '../../state/environmentAtom'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useNetworkLogo(chainId?: number) {
  const { bridgeNetworkInfo } = useAtomValue(environmentAtom)
  const theme = useTheme()
  const isSmartContractWallet = useIsSmartContractWallet()
  const isBridgingEnabled = useIsBridgingEnabled(isSmartContractWallet)

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
