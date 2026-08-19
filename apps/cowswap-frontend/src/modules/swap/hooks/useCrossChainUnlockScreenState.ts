import { useEffect, useState } from 'react'

import { isInjectedWidget } from '@cowprotocol/common-utils'
import { useIsEagerConnectInProgress, useIsSmartContractWallet, useWalletInfo } from '@cowprotocol/wallet'

import { useIsProviderNetworkDeprecated } from 'common/hooks/useIsProviderNetworkDeprecated'
import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

export interface CrossChainUnlockScreenContext {
  isConnected: boolean
  isEagerConnectInProgress: boolean
  isHydrated: boolean
  isInjectedWidget: boolean
  isNetworkDeprecated: boolean
  isNetworkUnsupported: boolean
  isSmartContractWallet: boolean | undefined
  isUnlocked: boolean
}

export type CrossChainUnlockScreenState = 'hidden' | 'pending' | 'visible'

export function getCrossChainUnlockScreenState({
  isConnected,
  isEagerConnectInProgress,
  isHydrated,
  isInjectedWidget,
  isNetworkDeprecated,
  isNetworkUnsupported,
  isSmartContractWallet,
  isUnlocked,
}: CrossChainUnlockScreenContext): CrossChainUnlockScreenState {
  if (!isHydrated) return 'pending'
  if ([isUnlocked, isNetworkUnsupported, isNetworkDeprecated, isInjectedWidget].some(Boolean)) return 'hidden'
  if (isConnected && isSmartContractWallet === undefined) return 'pending'
  if (isConnected) return isSmartContractWallet ? 'hidden' : 'visible'

  return isEagerConnectInProgress ? 'pending' : 'visible'
}

export function useCrossChainUnlockScreenState(isUnlocked: boolean): CrossChainUnlockScreenState {
  const [isHydrated, setIsHydrated] = useState(false)
  const isSmartContractWallet = useIsSmartContractWallet()
  const { account } = useWalletInfo()
  const isEagerConnectInProgress = useIsEagerConnectInProgress()
  const isNetworkUnsupported = useIsProviderNetworkUnsupported()
  const isNetworkDeprecated = useIsProviderNetworkDeprecated()

  useEffect(() => setIsHydrated(true), [])

  return getCrossChainUnlockScreenState({
    isConnected: Boolean(account),
    isEagerConnectInProgress,
    isHydrated,
    isInjectedWidget: isInjectedWidget(),
    isNetworkDeprecated,
    isNetworkUnsupported,
    isSmartContractWallet,
    isUnlocked,
  })
}
