import { useSetAtom } from 'jotai'
import { useMemo } from 'react'

import { TokenWithLogo, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { Command } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { WrapUnwrapCallback } from 'legacy/hooks/useWrapCallback'
import { Field } from 'legacy/state/types'

import { MAX_APPROVE_AMOUNT, TradeApproveCallback } from 'modules/erc20Approve'
import { useIsInfiniteApproveDisabledInWidget } from 'modules/injectedWidget'
import { RwaTokenStatus, useRwaConsentModalState, useRwaTokenStatus } from 'modules/rwa'
import { useSwapPartialApprovalToggleState } from 'modules/swap/hooks/useSwapSettings'
import { useDerivedTradeState, useOnCurrencySelection, useTradeConfirmActions } from 'modules/trade'

import { updateEthFlowContextAtom } from '../../../state/ethFlowContextAtom'

export interface EthFlowActionCallbacks {
  approve: TradeApproveCallback
  wrap: WrapUnwrapCallback | null
  directSwap: Command
  dismiss: Command
}

export interface EthFlowActions {
  approve(): Promise<void>

  wrap(): Promise<void>

  swap(): Promise<void>

  directSwap(): void
}

// eslint-disable-next-line max-lines-per-function
export function useEthFlowActions(callbacks: EthFlowActionCallbacks, amountToApprove?: bigint): EthFlowActions {
  const { chainId } = useWalletInfo()
  const { outputCurrency } = useDerivedTradeState() || {}

  const updateEthFlowContext = useSetAtom(updateEthFlowContextAtom)
  const onCurrencySelection = useOnCurrencySelection()
  const { onOpen: openSwapConfirmModal } = useTradeConfirmActions()
  const { openModal: openRwaConsentModal } = useRwaConsentModalState()
  const [isPartialApproveEnabledBySettings] = useSwapPartialApprovalToggleState()
  const isInfiniteApproveDisabledInWidget = useIsInfiniteApproveDisabledInWidget()
  const { status: rwaStatus, rwaTokenInfo } = useRwaTokenStatus({
    inputCurrency: WRAPPED_NATIVE_CURRENCIES[chainId],
    outputCurrency,
  })

  return useMemo(() => {
    function sendTransaction(type: 'approve' | 'wrap', callback: () => Promise<string | undefined>): Promise<void> {
      updateEthFlowContext({ [type]: { inProgress: true } })

      return callback()
        .catch((error) => {
          updateEthFlowContext({ [type]: { error } })
          callbacks.dismiss()
        })
        .then((txHash) => {
          if (txHash) {
            updateEthFlowContext({ [type]: { txHash } })
          }
        })
        .finally(() => {
          updateEthFlowContext({ [type]: { inProgress: false } })
        })
    }

    const swap = async (): Promise<void> => {
      if (rwaStatus === RwaTokenStatus.ChecksPending || rwaStatus === RwaTokenStatus.Restricted) {
        return
      }

      if (rwaStatus === RwaTokenStatus.RequiredConsent && rwaTokenInfo) {
        callbacks.dismiss()
        openRwaConsentModal({
          consentHash: rwaTokenInfo.consentHash,
          token: TokenWithLogo.fromToken(rwaTokenInfo.token),
        })
        return
      }

      callbacks.dismiss()
      onCurrencySelection(Field.INPUT, WRAPPED_NATIVE_CURRENCIES[chainId], () => {
        openSwapConfirmModal(true)
      })
    }

    const approve = (): Promise<void> => {
      const usePartialAmount = isPartialApproveEnabledBySettings || isInfiniteApproveDisabledInWidget
      const unitsToApprove = usePartialAmount ? amountToApprove || MAX_APPROVE_AMOUNT : MAX_APPROVE_AMOUNT

      if (isInfiniteApproveDisabledInWidget && !amountToApprove) {
        throw new Error('Approve amount must be defined when isInfiniteApproveDisabled')
      }

      return sendTransaction('approve', () => {
        return callbacks.approve(unitsToApprove).then((res): string | undefined => {
          const tx = res?.txResponse
          return (tx && 'transactionHash' in tx ? tx.transactionHash : (tx as { hash?: string })?.hash) as
            | string
            | undefined
        })
      })
    }

    const wrap = (useModals?: boolean): Promise<void> => {
      return sendTransaction('wrap', () => {
        if (!callbacks.wrap) return Promise.resolve(undefined)

        return callbacks.wrap({ useModals }).then((res) => {
          if (res == null) return undefined
          return typeof res === 'object' && 'hash' in res ? res.hash : res
        })
      })
    }

    const directSwap = (): void => {
      callbacks.dismiss()
      onCurrencySelection(Field.INPUT, WRAPPED_NATIVE_CURRENCIES[chainId])
      callbacks.directSwap()
    }

    return {
      swap,
      approve,
      wrap,
      directSwap,
    }
  }, [
    updateEthFlowContext,
    callbacks,
    onCurrencySelection,
    chainId,
    openSwapConfirmModal,
    openRwaConsentModal,
    isPartialApproveEnabledBySettings,
    isInfiniteApproveDisabledInWidget,
    amountToApprove,
    rwaStatus,
    rwaTokenInfo,
  ])
}
