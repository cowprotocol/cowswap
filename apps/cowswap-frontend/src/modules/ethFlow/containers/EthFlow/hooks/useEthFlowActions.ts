import { useSetAtom } from 'jotai'
import { useMemo } from 'react'

import { WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { Command } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { WrapUnwrapCallback } from 'legacy/hooks/useWrapCallback'
import { Field } from 'legacy/state/types'

import { useOnCurrencySelection, useTradeConfirmActions } from 'modules/trade'

import { TradeApproveCallback } from 'common/containers/TradeApprove'

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

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
export function useEthFlowActions(callbacks: EthFlowActionCallbacks): EthFlowActions {
  const { chainId } = useWalletInfo()

  const updateEthFlowContext = useSetAtom(updateEthFlowContextAtom)

  const onCurrencySelection = useOnCurrencySelection()
  const { onOpen: openSwapConfirmModal } = useTradeConfirmActions()

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

    // TODO: Add proper return type annotation
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const swap = async () => {
      callbacks.dismiss()
      onCurrencySelection(Field.INPUT, WRAPPED_NATIVE_CURRENCIES[chainId], () => {
        openSwapConfirmModal(true)
      })
    }

    // TODO: Add proper return type annotation
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const approve = (useModals?: boolean) => {
      return sendTransaction('approve', () => {
        return callbacks.approve({ useModals: !!useModals }).then((res) => res?.hash)
      })
    }

    // TODO: Add proper return type annotation
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const wrap = (useModals?: boolean) => {
      return sendTransaction('wrap', () => {
        if (!callbacks.wrap) return Promise.resolve(undefined)

        return callbacks.wrap({ useModals }).then((res) => res?.hash)
      })
    }

    // TODO: Add proper return type annotation
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const directSwap = () => {
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
  }, [callbacks, chainId, updateEthFlowContext, onCurrencySelection, openSwapConfirmModal])
}
