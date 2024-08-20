import { useCallback, useEffect } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useOrder } from 'legacy/state/orders/hooks'

import { CowModal } from 'common/pure/Modal'
import { OrderProgressBarV2 } from 'common/pure/OrderProgressBarV2'
import * as styledEl from 'common/pure/TransactionSubmittedContent/styled'

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
  const { surplusData, isProgressBarSetup } = progressBarV2Props
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

  return (
    <CowModal isOpen={isOpen} onDismiss={onDismiss} maxHeight={90} maxWidth={470}>
      <styledEl.Wrapper>
        <styledEl.Section>
          <styledEl.Header>
            <styledEl.CloseIconWrapper onClick={onDismiss} />
          </styledEl.Header>
          {isProgressBarSetup && (
            <OrderProgressBarV2 {...progressBarV2Props} order={order} navigateToNewOrder={navigateToNewOrderCallback(chainId, order, onDismiss)} />
          )}
        </styledEl.Section>
      </styledEl.Wrapper>
    </CowModal>
  )
}
