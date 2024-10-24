import { useMemo } from 'react'

import { Command } from '@cowprotocol/types'
import { useIsSmartContractWallet, useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import { useIsDarkMode } from 'legacy/state/user/hooks'

import { useTradeState, useTradeNavigate } from 'modules/trade'

import { useAddHook } from '../../hooks/useAddHook'
import { useEditHook } from '../../hooks/useEditHook'
import { useHookById } from '../../hooks/useHookById'
import { useOrderParams } from '../../hooks/useOrderParams'
import { HookDapp, HookDappContext as HookDappContextType } from '../../types/hooks'
import { isHookDappIframe } from '../../utils'
import { IframeDappContainer } from '../IframeDappContainer'
import { useHookBalancesDiff } from 'modules/hooksStore/hooks/useBalancesDiff'

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
  const isSmartContract = useIsSmartContractWallet()
  const provider = useWalletProvider()
  const tradeState = useTradeState()
  const tradeNavigate = useTradeNavigate()
  const isDarkMode = useIsDarkMode()
  const balancesDiff = useHookBalancesDiff(isPreHook, hookToEditDetails)

  const { inputCurrencyId = null, outputCurrencyId = null } = tradeState.state || {}
  const signer = useMemo(() => provider?.getSigner(), [provider])

  const context = useMemo<HookDappContextType>(() => {
    return {
      chainId,
      account,
      orderParams,
      hookToEdit: hookToEditDetails,
      signer,
      isSmartContract,
      isPreHook,
      isDarkMode,
      balancesDiff,
      editHook(...args) {
        editHook(...args)
        onDismiss()
      },
      addHook(hookToAdd) {
        addHook(hookToAdd)
        onDismiss()
      },
      setSellToken(tokenAddress: string) {
        tradeNavigate(chainId, { inputCurrencyId: tokenAddress, outputCurrencyId })
      },
      setBuyToken(tokenAddress: string) {
        tradeNavigate(chainId, { inputCurrencyId, outputCurrencyId: tokenAddress })
      },
    }
  }, [
    addHook,
    editHook,
    onDismiss,
    isPreHook,
    chainId,
    account,
    hookToEditDetails,
    signer,
    isSmartContract,
    tradeNavigate,
    inputCurrencyId,
    outputCurrencyId,
    isDarkMode,
    orderParams,
  ])

  const dappProps = useMemo(() => ({ context, dapp, isPreHook }), [context, dapp, isPreHook])

  if (isHookDappIframe(dapp)) {
    return <IframeDappContainer dapp={dapp} context={context} />
  }

  return dapp.component(dappProps)
}
