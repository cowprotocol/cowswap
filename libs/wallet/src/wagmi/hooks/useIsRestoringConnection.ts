import { useAtomValue } from 'jotai'

import { useAppKitState } from '@reown/appkit/react'
import { useConnection } from 'wagmi'

import { useWalletInfo } from '../../api/hooks'
import { appWalletContextAtom } from '../../state/appWalletContext.atom'

export function useIsRestoringConnection(): boolean {
  const appWalletContext = useAtomValue(appWalletContextAtom)
  const { status } = useConnection()
  const { account } = useWalletInfo()
  const state = useAppKitState()
  const { loading, initialized } = state

  const isWidgetDappMode = appWalletContext?.standaloneMode === false

  // In widget with Dapp Mode we use the widget connected which doesn't answer on accounts request
  // So we don't consider it's as reconnecting at all, because otherwise it will be stuck in that state
  if (isWidgetDappMode) return false
  if (loading || !initialized) return true
  if (status === 'reconnecting') return true

  return status === 'connected' && !account
}
