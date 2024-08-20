import { useCallback, useEffect } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useOrder } from 'legacy/state/orders/hooks'

import { CowModal } from 'common/pure/Modal'
import { TransactionSubmittedContent } from 'common/pure/TransactionSubmittedContent'

import { useTradeConfirmState } from '../../../trade'
import { useOrderIdForSurplusModal, useRemoveOrderFromSurplusQueue } from '../../state/surplusModal'
import { useNavigateToNewOrderCallback, useSetupAdditionalProgressBarProps } from '../ConfirmSwapModalSetup'

// TODO: rename?
export function SurplusModalSetup() {
  const orderId = useOrderIdForSurplusModal()
  const removeOrderId = useRemoveOrderFromSurplusQueue()

  const { chainId } = useWalletInfo()
  const order = useOrder({ id: orderId, chainId })

  const progressBarV2Props = useSetupAdditionalProgressBarProps(chainId, order)
  const { surplusData, isProgressBarSetup, activityDerivedState } = progressBarV2Props
  const { showSurplus } = surplusData

  const { isOpen: isConfirmationModalOpen } = useTradeConfirmState()

  const onDismiss = useCallback(() => {
    orderId && removeOrderId(orderId)
  }, [orderId, removeOrderId])

  const navigateToNewOrderCallback = useNavigateToNewOrderCallback()

  useEffect(() => {
    // If we should NOT show the screen, remove the orderId from the queue
    if (((showSurplus === false && order?.status === 'fulfilled') || isConfirmationModalOpen) && orderId) {
      removeOrderId(orderId)
    }
  }, [orderId, order?.status, removeOrderId, showSurplus, isConfirmationModalOpen])

  const isOpen = !!orderId && !isConfirmationModalOpen && (showSurplus === true || isProgressBarSetup)

  if (!orderId) {
    return null
  }

  return (
    <CowModal isOpen={isOpen} onDismiss={onDismiss} maxHeight={90} maxWidth={470}>
      <TransactionSubmittedContent
        onDismiss={onDismiss}
        chainId={chainId}
        hash={orderId}
        activityDerivedState={activityDerivedState}
        orderProgressBarV2Props={progressBarV2Props}
        navigateToNewOrderCallback={navigateToNewOrderCallback}
      />
    </CowModal>
  )
}
