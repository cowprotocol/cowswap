import { useMemo } from 'react'

import { Command } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import { useAddHook } from '../../hooks/useAddHook'
import { useEditHook } from '../../hooks/useEditHook'
import { useHookById } from '../../hooks/useHookById'
import { useOrderParams } from '../../hooks/useOrderParams'
import { HookDapp, HookDappContext as HookDappContextType } from '../../types/hooks'
import { isHookDappIframe } from '../../utils'
import { IframeDappContainer } from '../IframeDappContainer'

interface HookDappContainerProps {
  dapp: HookDapp
  isPreHook: boolean
  onDismiss: Command
  hookToEdit?: string
}

export function HookDappContainer({ dapp, isPreHook, onDismiss, hookToEdit }: HookDappContainerProps) {
  const { chainId, account } = useWalletInfo()
  const addHook = useAddHook(dapp, isPreHook)
  const editHook = useEditHook(isPreHook)

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
    }
  }, [addHook, editHook, onDismiss, chainId, account, hookToEditDetails, signer])

  const dappProps = useMemo(() => ({ context, dapp, isPreHook }), [context, dapp, isPreHook])

  if (isHookDappIframe(dapp)) {
    return <IframeDappContainer dapp={dapp} context={context} />
  }

  return dapp.component(dappProps)
}
