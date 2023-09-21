import { useCallback, useEffect } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useOrder } from 'legacy/state/orders/hooks'

import { useGetSurplusData } from 'common/hooks/useGetSurplusFiatValue'
import { CowModal } from 'common/pure/Modal'
import * as styledEl from 'common/pure/TransactionSubmittedContent/styled'
import { SurplusModal } from 'common/pure/TransactionSubmittedContent/SurplusModal'

import { useOrderIdForSurplusModal, useRemoveOrderFromSurplusQueue } from '../../state/surplusModal'

export function SurplusModalSetup() {
  const orderId = useOrderIdForSurplusModal()
  const removeOrderId = useRemoveOrderFromSurplusQueue()

  const { chainId } = useWalletInfo()
  const order = useOrder({ id: orderId, chainId })
  const { showSurplus } = useGetSurplusData(order)

  const onDismiss = useCallback(() => {
    orderId && removeOrderId(orderId)
  }, [orderId, removeOrderId])

  useEffect(() => {
    // If we should NOT show the surplus, remove the orderId from the queue
    if (showSurplus === false && orderId) {
      removeOrderId(orderId)
    }
  }, [orderId, removeOrderId, showSurplus])

  const isOpen = !!orderId && showSurplus === true

  return (
    <CowModal isOpen={isOpen} onDismiss={onDismiss} maxHeight={90} maxWidth={470}>
      <styledEl.Wrapper>
        <styledEl.Section>
          <styledEl.Header>
            <styledEl.CloseIconWrapper onClick={onDismiss} />
          </styledEl.Header>
          <SurplusModal order={order} />
        </styledEl.Section>
      </styledEl.Wrapper>
    </CowModal>
  )
}
