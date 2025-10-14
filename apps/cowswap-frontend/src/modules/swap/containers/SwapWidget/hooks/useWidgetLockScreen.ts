import { useCallback, useEffect, useMemo, useState } from 'react'

import { isInjectedWidget } from '@cowprotocol/common-utils'
import { useIsSmartContractWallet, useWalletInfo, useIsEagerConnectInProgress } from '@cowprotocol/wallet'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import { useSwapDerivedState } from '../../../hooks/useSwapDerivedState'
import { useUpdateSwapRawState } from '../../../hooks/useUpdateSwapRawState'

interface WalletStatus {
  isSmartContractWallet: ReturnType<typeof useIsSmartContractWallet>
  account: ReturnType<typeof useWalletInfo>['account']
  isEagerConnectInProgress: ReturnType<typeof useIsEagerConnectInProgress>
  isNetworkUnsupported: boolean
}

interface LockScreenArgs {
  isHydrated: boolean
  isUnlocked: boolean
  isNetworkUnsupported: boolean
  account?: string
  isSmartContractWallet: boolean | undefined
  isEagerConnectInProgress: boolean
}

export function useLockScreenState(
  derivedState: ReturnType<typeof useSwapDerivedState>,
  updateSwapState: ReturnType<typeof useUpdateSwapRawState>,
): {
  handleUnlock: () => void
  shouldShowLockScreen: boolean
} {
  const walletStatus = useWalletStatus()
  const isHydrated = useHydrationFlag()
  const handleUnlock = useCallback(() => updateSwapState({ isUnlocked: true }), [updateSwapState])

  const shouldShowLockScreen = useShouldShowLockScreen({
    isHydrated,
    isUnlocked: derivedState.isUnlocked,
    isNetworkUnsupported: walletStatus.isNetworkUnsupported,
    account: walletStatus.account,
    isSmartContractWallet: walletStatus.isSmartContractWallet,
    isEagerConnectInProgress: walletStatus.isEagerConnectInProgress,
  })

  return useMemo(() => ({ handleUnlock, shouldShowLockScreen }), [handleUnlock, shouldShowLockScreen])
}

function useShouldShowLockScreen({
  isHydrated,
  isUnlocked,
  isNetworkUnsupported,
  account,
  isSmartContractWallet,
  isEagerConnectInProgress,
}: LockScreenArgs): boolean {
  return useMemo(() => {
    if (!isHydrated || isUnlocked || isNetworkUnsupported) return false
    if (isInjectedWidget()) return false
    const isConnected = Boolean(account)

    if (isConnected) {
      return isSmartContractWallet === false
    }

    return !isEagerConnectInProgress
  }, [isHydrated, isUnlocked, isNetworkUnsupported, account, isSmartContractWallet, isEagerConnectInProgress])
}

function useHydrationFlag(): boolean {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return isHydrated
}

function useWalletStatus(): WalletStatus {
  const isSmartContractWallet = useIsSmartContractWallet()
  const { account } = useWalletInfo()
  const isEagerConnectInProgress = useIsEagerConnectInProgress()
  const isNetworkUnsupported = useIsProviderNetworkUnsupported()

  return useMemo(
    () => ({ isSmartContractWallet, account, isEagerConnectInProgress, isNetworkUnsupported }),
    [isSmartContractWallet, account, isEagerConnectInProgress, isNetworkUnsupported],
  )
}
