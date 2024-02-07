import { useSetAtom } from 'jotai'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { useWalletInfo } from '@cowprotocol/wallet'

import { WrapUnwrapCallback } from 'legacy/hooks/useWrapCallback'
import { Field } from 'legacy/state/types'

import { HandleSwapCallback } from 'modules/swap/pure/SwapButtons'
import { useTradeConfirmActions } from 'modules/trade'

import { TradeApproveCallback } from 'common/containers/TradeApprove/useTradeApproveCallback'

import { useDerivedSwapInfo, useSwapActionHandlers } from '../../../hooks/useSwapState'
import { ethFlowContextAtom, updateEthFlowContextAtom } from '../../../state/EthFlow/ethFlowContextAtom'

export interface EthFlowActionCallbacks {
  approve: TradeApproveCallback
  wrap: WrapUnwrapCallback | null
  directSwap: HandleSwapCallback
  dismiss: () => void
}

export interface EthFlowActions {
  expertModeFlow(): Promise<void>
  approve(): Promise<void>
  wrap(): Promise<void>
  swap(): Promise<void>
  directSwap(): void
}

export function useEthFlowActions(callbacks: EthFlowActionCallbacks): EthFlowActions {
  const { chainId } = useWalletInfo()
  const { v2Trade: trade } = useDerivedSwapInfo()

  const ethFlowContext = useAtomValue(ethFlowContextAtom)
  const updateEthFlowContext = useSetAtom(updateEthFlowContextAtom)

  const { onCurrencySelection } = useSwapActionHandlers()
  const { onOpen: openSwapConfirmModal } = useTradeConfirmActions()

  const {
    approve: { isNeeded: isApproveNeeded },
    wrap: { isNeeded: isWrapNeeded },
  } = ethFlowContext

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

    const swap = async () => {
      if (!chainId || !trade) return

      callbacks.dismiss()
      onCurrencySelection(Field.INPUT, WRAPPED_NATIVE_CURRENCIES[chainId])
      openSwapConfirmModal()
    }

    const approve = (useModals?: boolean) => {
      return sendTransaction('approve', () => {
        return callbacks.approve({ useModals: !!useModals }).then((res) => res?.hash)
      })
    }

    const wrap = (useModals?: boolean) => {
      return sendTransaction('wrap', () => {
        if (!callbacks.wrap) return Promise.resolve(undefined)

        return callbacks.wrap({ useModals }).then((res) => res?.hash)
      })
    }

    const expertModeFlow = () => {
      return Promise.all([isApproveNeeded ? approve(false) : undefined, isWrapNeeded ? wrap(false) : undefined]).then(
        () => void 0
      )
    }

    const directSwap = () => {
      if (!chainId || !trade) return

      callbacks.dismiss()
      onCurrencySelection(Field.INPUT, WRAPPED_NATIVE_CURRENCIES[chainId])
      callbacks.directSwap()
    }

    return {
      swap,
      approve,
      wrap,
      expertModeFlow,
      directSwap,
    }
  }, [
    callbacks,
    isApproveNeeded,
    isWrapNeeded,
    chainId,
    trade,
    updateEthFlowContext,
    onCurrencySelection,
    openSwapConfirmModal,
  ])
}
