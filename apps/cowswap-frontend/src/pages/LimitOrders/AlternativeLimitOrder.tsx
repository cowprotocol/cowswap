import { useCallback } from 'react'

import { LimitOrdersWidget } from 'modules/limitOrders'

import { NewModal } from 'common/pure/NewModal'
import { useHideAlternativeOrderModal } from 'common/state/alternativeOrder'

export function AlternativeLimitOrder() {
  const hideAlternativeOrderModal = useHideAlternativeOrderModal()

  const onDismiss = useCallback(() => hideAlternativeOrderModal(), [hideAlternativeOrderModal])

  // TODO: update title according to order status: `pending ? edit : recreate`
  // TODO: pass down OR update the order placement callback directly to go back to regular mode
  return (
    <NewModal title={'Recreate order'} onDismiss={onDismiss} modalMode>
      <LimitOrdersWidget />
    </NewModal>
  )
}
