import { useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'
import { useSetAtom } from 'jotai'
import { useResetAtom } from 'jotai/utils'

import { useWalletInfo } from 'hooks/useWalletInfo'
import { Order, OrderStatus } from 'state/orders/actions'
import { useCloseModal, useOpenModal } from 'state/application/hooks'
import { ApplicationModal } from 'state/application/reducer'
import { getIsEthFlowOrder } from '@cow/modules/swap/containers/EthFlowStepper'
import { getSwapErrorMessage } from '@cow/modules/swap/services/common/steps/swapErrorHelper'

import { useEthFlowCancelOrder } from './useEthFlowCancelOrder'
import { useOffChainCancelOrder } from './useOffChainCancelOrder'
import { cancellationModalContextAtom, updateCancellationModalContextAtom } from './state'

export type UseCancelOrderReturn = (() => void) | null

/**
 *
 * This hook encapsulates all the logic related to order cancellation, be it off or on-chain
 * It returns a callback which in turn returns a callback
 * It also handles the modal display logic
 *
 * The first callback takes an Order object to construct the callback which will trigger the cancellation modal display
 * It checks whether the order is eligible for cancellation and set's up which type of cancellation can be used (on or off-chain)
 * In case the order is not eligible, it returns null. This should be used to control whether a cancel button should be displayed
 */
export function useCancelOrder(): (order: Order) => UseCancelOrderReturn {
  const { chainId } = useWeb3React()
  const { allowsOffchainSigning } = useWalletInfo()
  const openModal = useOpenModal(ApplicationModal.CANCELLATION)
  const closeModal = useCloseModal(ApplicationModal.CANCELLATION)
  const setContext = useSetAtom(updateCancellationModalContextAtom)
  const resetContext = useResetAtom(cancellationModalContextAtom)
  const offChainOrderCancel = useOffChainCancelOrder()
  const ethFlowOrderCancel = useEthFlowCancelOrder()

  return useCallback(
    (order: Order) => {
      // Check the 'cancellability'

      const isEthFlowOrder = getIsEthFlowOrder(order)

      // 1. EthFlow orders will never be able to be cancelled offChain
      // 2. The wallet must support offChain singing
      // 3. The order must be PENDING
      const isOffChainCancellable = !isEthFlowOrder && allowsOffchainSigning && order?.status === OrderStatus.PENDING

      // 1. To be EthFlow cancellable the order must be an EthFlow order
      // 2. It can be cancelled when the order is CREATING or PENDING
      const isEthFlowCancellable =
        isEthFlowOrder && (order?.status === OrderStatus.CREATING || order?.status === OrderStatus.PENDING)

      // TODO: For now only ethflow orders are cancellable. Adjust when implementing general hard cancellations
      const isCancellable = !order.isCancelling && (isOffChainCancellable || isEthFlowCancellable)

      // When the order is not cancellable, there won't be a callback
      if (!isCancellable) {
        return null
      }

      const type = isOffChainCancellable ? 'offChain' : 'ethFlow'
      const cancelFn = type === 'offChain' ? offChainOrderCancel : ethFlowOrderCancel

      // When dismissing the modal, close it and also reset context
      const onDismiss = () => {
        closeModal()
        resetContext()
      }

      // The callback to trigger the cancellation
      const triggerCancellation = async (): Promise<void> => {
        try {
          setContext({ isPendingSignature: true, error: null })
          // Actual cancellation is triggered here
          await cancelFn(order)
          // When done, dismiss the modal
          onDismiss()
        } catch (e) {
          const swapErrorMessage = getSwapErrorMessage(e)
          setContext({ error: swapErrorMessage })
        }
        setContext({ isPendingSignature: false })
      }

      // The callback returned that triggers the modal
      return () => {
        // Updates the cancellation context with details pertaining the order
        setContext({
          orderId: order.id,
          chainId,
          summary: order?.summary,
          type,
          onDismiss,
          triggerCancellation,
        })
        // Display the actual modal
        openModal()
      }
    },
    [
      allowsOffchainSigning,
      chainId,
      closeModal,
      ethFlowOrderCancel,
      offChainOrderCancel,
      openModal,
      resetContext,
      setContext,
    ]
  )
}
