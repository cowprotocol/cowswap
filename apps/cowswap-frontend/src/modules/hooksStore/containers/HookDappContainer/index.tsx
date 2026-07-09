import { useCallback, useEffect, useMemo, useState } from 'react'

import { Command } from '@cowprotocol/types'
import { useIsSmartContractWallet, useWalletInfo } from '@cowprotocol/wallet'

import { useOrderParams } from 'entities/orderHooks/useOrderParams'

import { useIsDarkMode } from 'legacy/state/user/hooks'

import { useTradeState, useTradeNavigate } from 'modules/trade'

import {
  getValidatedIframeAddHookRequest,
  getValidatedIframeEditHookRequest,
  getValidatedIframeTokenAddress,
  PendingIframeHookMutation,
} from './hookDappIframeRequests.utils'

import { useAddHook } from '../../hooks/useAddHook'
import { useHookBalancesDiff } from '../../hooks/useBalancesDiff'
import { useEditHook } from '../../hooks/useEditHook'
import { useHookById } from '../../hooks/useHookById'
import { useHookStateDiff } from '../../hooks/useStateDiff'
import { HookDappIframeReview } from '../../pure/HookDappIframeReview'
import { HookDapp, HookDappContext as HookDappContextType } from '../../types/hooks'
import { isHookDappIframe } from '../../utils'
import { IframeDappContainer } from '../IframeDappContainer'

interface HookDappContainerProps {
  dapp: HookDapp
  isPreHook: boolean
  onDismiss: Command
  hookToEdit?: string
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function HookDappContainer({ dapp, isPreHook, onDismiss, hookToEdit }: HookDappContainerProps) {
  const { chainId, account } = useWalletInfo()
  const addHook = useAddHook(dapp, isPreHook)
  const editHook = useEditHook(isPreHook)
  const [pendingIframeMutation, setPendingIframeMutation] = useState<PendingIframeHookMutation | null>(null)

  const hookToEditDetails = useHookById(hookToEdit, isPreHook)
  const orderParams = useOrderParams()
  const isSmartContract = useIsSmartContractWallet()
  const tradeState = useTradeState()
  const tradeNavigate = useTradeNavigate()
  const isDarkMode = useIsDarkMode()
  const balancesDiff = useHookBalancesDiff(isPreHook, hookToEditDetails?.uuid)
  const stateDiff = useHookStateDiff(isPreHook, hookToEditDetails?.uuid)

  const { inputCurrencyId = null, outputCurrencyId = null } = tradeState.state || {}

  const context = useMemo<HookDappContextType>(() => {
    return {
      chainId,
      account,
      orderParams,
      hookToEdit: hookToEditDetails,
      isSmartContract,
      isPreHook,
      isDarkMode,
      balancesDiff,
      stateDiff,
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
    isSmartContract,
    tradeNavigate,
    inputCurrencyId,
    outputCurrencyId,
    isDarkMode,
    orderParams,
    balancesDiff,
    stateDiff,
  ])

  const dappProps = useMemo(() => ({ context, dapp, isPreHook }), [context, dapp, isPreHook])

  useEffect(() => {
    setPendingIframeMutation(null)
  }, [dapp.id, hookToEdit])

  const applyPendingIframeMutation = useCallback(() => {
    if (!pendingIframeMutation) {
      return
    }

    if (pendingIframeMutation.type === 'add') {
      addHook(pendingIframeMutation.payload)
    } else {
      editHook(pendingIframeMutation.payload)
    }

    setPendingIframeMutation(null)
    onDismiss()
  }, [addHook, editHook, onDismiss, pendingIframeMutation])

  const cancelPendingIframeMutation = useCallback(() => {
    setPendingIframeMutation(null)
  }, [])

  const onAddHookRequest = useCallback(
    (payload: unknown) => {
      const mutation = getValidatedIframeAddHookRequest(payload, hookToEdit)

      if (mutation) {
        setPendingIframeMutation(mutation)
      }
    },
    [hookToEdit],
  )

  const onEditHookRequest = useCallback(
    (payload: unknown) => {
      const mutation = getValidatedIframeEditHookRequest(payload, hookToEdit)

      if (mutation) {
        setPendingIframeMutation(mutation)
      }
    },
    [hookToEdit],
  )

  const onSetSellTokenRequest = useCallback(
    (payload: unknown) => {
      const tokenAddress = getValidatedIframeTokenAddress(payload)

      if (!tokenAddress) {
        return
      }

      tradeNavigate(chainId, { inputCurrencyId: tokenAddress, outputCurrencyId })
    },
    [chainId, outputCurrencyId, tradeNavigate],
  )

  const onSetBuyTokenRequest = useCallback(
    (payload: unknown) => {
      const tokenAddress = getValidatedIframeTokenAddress(payload)

      if (!tokenAddress) {
        return
      }

      tradeNavigate(chainId, { inputCurrencyId, outputCurrencyId: tokenAddress })
    },
    [chainId, inputCurrencyId, tradeNavigate],
  )

  if (isHookDappIframe(dapp)) {
    if (pendingIframeMutation) {
      return (
        <HookDappIframeReview
          chainId={chainId}
          dappName={dapp.name}
          dappUrl={dapp.url}
          isPreHook={isPreHook}
          mutation={pendingIframeMutation}
          onCancel={cancelPendingIframeMutation}
          onConfirm={applyPendingIframeMutation}
        />
      )
    }

    return (
      <IframeDappContainer
        dapp={dapp}
        context={context}
        onAddHookRequest={onAddHookRequest}
        onEditHookRequest={onEditHookRequest}
        onSetSellTokenRequest={onSetSellTokenRequest}
        onSetBuyTokenRequest={onSetBuyTokenRequest}
      />
    )
  }

  return dapp.component(dappProps)
}
