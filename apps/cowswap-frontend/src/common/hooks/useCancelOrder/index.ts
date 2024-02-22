import { useAtomValue, useSetAtom } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import { useCallback } from 'react'

import { calculateGasMargin } from '@cowprotocol/common-utils'
import { Command } from '@cowprotocol/types'
import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { useCloseModal, useOpenModal } from 'legacy/state/application/hooks'
import { ApplicationModal } from 'legacy/state/application/reducer'
import { useGasPrices } from 'legacy/state/gas/hooks'
import { Order, OrderStatus } from 'legacy/state/orders/actions'

import { getIsEthFlowOrder } from 'modules/swap/containers/EthFlowStepper'
import { getSwapErrorMessage } from 'modules/trade/utils/swapErrorHelper'

import { useGetOnChainCancellation } from 'common/hooks/useCancelOrder/useGetOnChainCancellation'
import { computeOrderSummary } from 'common/updaters/orders/utils'
import { isOrderCancellable } from 'common/utils/isOrderCancellable'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'

import { cancellationModalContextAtom, CancellationType, updateCancellationModalContextAtom } from './state'
import { useOffChainCancelOrder } from './useOffChainCancelOrder'
import { useSendOnChainCancellation } from './useSendOnChainCancellation'

export type UseCancelOrderReturn = Command | null

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
  const { chainId } = useWalletInfo()
  const { allowsOffchainSigning } = useWalletDetails()
  const openModal = useOpenModal(ApplicationModal.CANCELLATION)
  const closeModal = useCloseModal(ApplicationModal.CANCELLATION)
  const { isPendingSignature } = useAtomValue(cancellationModalContextAtom)
  const setContext = useSetAtom(updateCancellationModalContextAtom)
  const resetContext = useResetAtom(cancellationModalContextAtom)
  const offChainOrderCancel = useOffChainCancelOrder()
  const sendOnChainCancellation = useSendOnChainCancellation()
  const getOnChainTxInfo = useGetOnChainCancellation()
  const gasPrices = useGasPrices(chainId)
  const nativeCurrency = useNativeCurrency()

  return useCallback(
    (order: Order) => {
      // Check the 'cancellability'

      const isEthFlowOrder = getIsEthFlowOrder(order.inputToken.address)

      // 1. EthFlow orders will never be able to be cancelled offChain
      // 2. The wallet must support offChain singing
      // 3. The order must be PENDING
      const isOffChainCancellable = !isEthFlowOrder && allowsOffchainSigning && order?.status === OrderStatus.PENDING

      // When the order is not cancellable, there won't be a callback
      if (!isOrderCancellable(order)) {
        return null
      }

      // When dismissing the modal, close it and also reset context
      const onDismiss = () => {
        closeModal()
        resetContext()
      }

      // The callback to trigger the cancellation
      const triggerCancellation = async (type: CancellationType): Promise<void> => {
        const cancelFn = type === 'offChain' ? offChainOrderCancel : sendOnChainCancellation

        try {
          setContext({ isPendingSignature: true, error: null })
          // Actual cancellation is triggered here
          await cancelFn(order)
          onDismiss()
          // When done, dismiss the modal
        } catch (e: any) {
          onDismiss()
          if (!isPendingSignature) return

          const swapErrorMessage = getSwapErrorMessage(e?.body?.description || e)
          setContext({ error: swapErrorMessage })
        }
        setContext({ isPendingSignature: false })
      }

      // The callback returned that triggers the modal
      return () => {
        const summary = computeOrderSummary({
          orderFromStore: order,
          orderFromApi: null,
        })
        // Updates the cancellation context with details pertaining the order
        setContext({
          orderId: order.id,
          chainId,
          summary,
          defaultType: isOffChainCancellable ? 'offChain' : 'onChain',
          onDismiss,
          triggerCancellation,
          nativeCurrency,
        })
        // Display the actual modal
        openModal()
        // Estimate tx cost in case when OnChain cancellation is used
        getOnChainTxInfo(order).then(({ estimatedGas }) => {
          const gasPrice = +(gasPrices?.average || '0')
          const txCost = calculateGasMargin(estimatedGas).mul(gasPrice)

          setContext({ txCost })
        })
      }
    },
    [
      allowsOffchainSigning,
      chainId,
      closeModal,
      sendOnChainCancellation,
      offChainOrderCancel,
      openModal,
      resetContext,
      setContext,
      getOnChainTxInfo,
      gasPrices,
      nativeCurrency,
      isPendingSignature,
    ]
  )
}
