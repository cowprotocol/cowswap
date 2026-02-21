import { useSetAtom } from 'jotai'
import { useMemo } from 'react'

import { WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { Command } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { WrapUnwrapCallback } from 'legacy/hooks/useWrapCallback'
import { Field } from 'legacy/state/types'

import { MAX_APPROVE_AMOUNT, TradeApproveCallback } from 'modules/erc20Approve'
import { useSwapPartialApprovalToggleState } from 'modules/swap/hooks/useSwapSettings'
import { useOnCurrencySelection, useTradeConfirmActions } from 'modules/trade'

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

export function useEthFlowActions(callbacks: EthFlowActionCallbacks, amountToApprove?: bigint): EthFlowActions {
  const { chainId } = useWalletInfo()

  const updateEthFlowContext = useSetAtom(updateEthFlowContextAtom)
  const onCurrencySelection = useOnCurrencySelection()
  const { onOpen: openSwapConfirmModal } = useTradeConfirmActions()
  const [isPartialApproveEnabledBySettings] = useSwapPartialApprovalToggleState()

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
      callbacks.dismiss()
      onCurrencySelection(Field.INPUT, WRAPPED_NATIVE_CURRENCIES[chainId], () => {
        openSwapConfirmModal(true)
      })
    }

    const approve = (): Promise<void> => {
      const unitsToApprove = isPartialApproveEnabledBySettings
        ? amountToApprove || MAX_APPROVE_AMOUNT
        : MAX_APPROVE_AMOUNT
      return sendTransaction('approve', () => {
        return callbacks.approve(unitsToApprove).then((res) => res?.txResponse.transactionHash)
      })
    }

    const wrap = (useModals?: boolean): Promise<void> => {
      return sendTransaction('wrap', () => {
        if (!callbacks.wrap) return Promise.resolve(undefined)

        return callbacks.wrap({ useModals }).then((res) => res || undefined)
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
    isPartialApproveEnabledBySettings,
    amountToApprove,
  ])
}
