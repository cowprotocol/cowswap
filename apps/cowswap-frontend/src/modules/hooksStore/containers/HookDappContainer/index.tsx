import { useMemo } from 'react'

import { Command, HookDapp, HookDappContext as HookDappContextType } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useAddHook } from '../../hooks/useAddHook'
import { isHookDappIframe } from '../../utils'

interface HookDappContainerProps {
  dapp: HookDapp
  isPreHook: boolean
  onDismiss: Command
  onDismissModal: Command
}

export function HookDappContainer({ dapp, isPreHook, onDismiss, onDismissModal }: HookDappContainerProps) {
  const { chainId, account } = useWalletInfo()
  const addHook = useAddHook(dapp, isPreHook)

  const context = useMemo<HookDappContextType>(() => {
    return {
      chainId,
      account,
      addHook: (hookToAdd) => {
        const hook = addHook(hookToAdd)
        onDismiss()

        return hook
      },
      close: onDismissModal,
    }
  }, [addHook, onDismiss, onDismissModal, chainId, account])

  const dappProps = useMemo(() => ({ context, dapp, isPreHook }), [context, dapp, isPreHook])

  if (isHookDappIframe(dapp)) {
    // TODO: Create iFrame
    return <>{dapp.name}</>
  }

  return dapp.component(dappProps)
}
