import { useCallback } from 'react'

import { useOrder } from 'legacy/state/orders/hooks'

import { useWalletInfo } from 'modules/wallet'

import { CowModal } from 'common/pure/Modal'
import * as styledEl from 'common/pure/TransactionSubmittedContent/styled'
import { SurplusModal } from 'common/pure/TransactionSubmittedContent/SurplusModal'

import { useOrderIdForSurplusModal, useRemoveOrderFromSurplusQueue } from '../../state/surplusModal'

export function SurplusModalSetup() {
  const orderId = useOrderIdForSurplusModal()
  const removeOrderId = useRemoveOrderFromSurplusQueue()

  const { chainId } = useWalletInfo()
  const order = useOrder({ id: orderId, chainId })

  const onDismiss = useCallback(() => {
    orderId && removeOrderId(orderId)
  }, [orderId, removeOrderId])

  const isOpen = !!orderId

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
