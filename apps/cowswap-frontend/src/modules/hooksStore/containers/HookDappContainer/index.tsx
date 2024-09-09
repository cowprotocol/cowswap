import { useMemo } from 'react'

import { Command, HookDapp, HookDappContext as HookDappContextType } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import { useAddHook } from '../../hooks/useAddHook'
import { useEditHook } from '../../hooks/useEditHook'
import { useHookById } from '../../hooks/useHookById'
import { useOrderParams } from '../../hooks/useOrderParams'
import { isHookDappIframe } from '../../utils'

interface HookDappContainerProps {
  dapp: HookDapp
  isPreHook: boolean
  onDismiss: Command
  onDismissModal: Command
  hookToEdit?: string
}

export function HookDappContainer({ dapp, isPreHook, onDismiss, onDismissModal, hookToEdit }: HookDappContainerProps) {
  const { chainId, account } = useWalletInfo()
  const addHook = useAddHook(dapp, isPreHook)
  const editHook = useEditHook()

  const hookToEditDetails = useHookById(hookToEdit, isPreHook)
  const orderParams = useOrderParams()
  const provider = useWalletProvider()
  const signer = useMemo(() => provider?.getSigner(), [provider])

  const context = useMemo<HookDappContextType>(() => {
    return {
      chainId,
      account,
      orderParams,
      hookToEdit: hookToEditDetails,
      signer,
      editHook: (...args) => {
        editHook(...args)
        onDismiss()
      },
      addHook: (hookToAdd) => {
        const hook = addHook(hookToAdd)
        onDismiss()

        return hook
      },
      close: onDismissModal,
    }
  }, [addHook, editHook, onDismiss, onDismissModal, chainId, account, hookToEditDetails, signer])

  const dappProps = useMemo(() => ({ context, dapp, isPreHook }), [context, dapp, isPreHook])

  if (isHookDappIframe(dapp)) {
    // TODO: Create iFrame
    return <>{dapp.name}</>
  }

  return dapp.component(dappProps)
}
