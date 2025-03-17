import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'

import { environmentAtom } from '../../state/environmentAtom'

export function useNetworkLogo(chainId?: number) {
  const { bridgeNetworkInfo } = useAtomValue(environmentAtom)

  if (!chainId) return undefined

  const baseNetworkInfo: string | undefined = useMemo(() => {
    if (!chainId) {
      return undefined
    }

    return getChainInfo(chainId).logo.light
  }, [chainId])

  if (baseNetworkInfo) return baseNetworkInfo

  return bridgeNetworkInfo?.find((network) => network.id === chainId)?.logoUrl?.light
}
