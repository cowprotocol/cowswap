import { useMemo } from 'react'
import { Field } from 'state/swap/actions'
import { WRAPPED_NATIVE_CURRENCY } from 'constants/tokens'
import { useAtomValue } from 'jotai/utils'
import { ethFlowContextAtom, updateEthFlowContextAtom } from '../../../state/ethFlowContextAtom'
import { useSetAtom } from 'jotai'
import { useDerivedSwapInfo, useSwapActionHandlers } from 'state/swap/hooks'
import { useSwapConfirmManager } from 'cow-react/modules/swap/hooks/useSwapConfirmManager'
import { useWeb3React } from '@web3-react/core'
import { WrapUnwrapCallback } from 'hooks/useWrapCallback'
import { ApproveCallback } from 'hooks/useApproveCallback'

export interface EthFlowActionCallbacks {
  approve: ApproveCallback
  wrap: WrapUnwrapCallback | null
  dismiss: () => void
}

export interface EthFlowActions {
  expertModeFlow(): void
  approve(): void
  wrap(): void
  swap(): void
}

export function useEthFlowActions(callbacks: EthFlowActionCallbacks): EthFlowActions {
  const { chainId } = useWeb3React()
  const { v2Trade: trade } = useDerivedSwapInfo()

  const ethFlowContext = useAtomValue(ethFlowContextAtom)
  const updateEthFlowContext = useSetAtom(updateEthFlowContextAtom)

  const { onCurrencySelection } = useSwapActionHandlers()
  const { openSwapConfirmModal } = useSwapConfirmManager()

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

    const swap = () => {
      if (!chainId || !trade) return

      callbacks.dismiss()
      onCurrencySelection(Field.INPUT, WRAPPED_NATIVE_CURRENCY[chainId])
      openSwapConfirmModal(trade)
    }

    const approve = () => {
      return sendTransaction('approve', () => {
        return callbacks.approve().then((res) => res?.hash)
      })
    }

    const wrap = () => {
      return sendTransaction('wrap', () => {
        if (!callbacks.wrap) return Promise.resolve(undefined)

        return callbacks.wrap().then((res) => res?.hash)
      })
    }

    const expertModeFlow = () => {
      Promise.all([isApproveNeeded ? approve() : undefined, isWrapNeeded ? wrap() : undefined])
    }

    return {
      swap,
      approve,
      wrap,
      expertModeFlow,
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
