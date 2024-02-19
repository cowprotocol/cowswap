import { useCallback } from 'react'

import { LimitOrdersWidget } from 'modules/limitOrders'

import { NewModal } from 'common/pure/NewModal'
import { useUpdateAlternativeOrderModalVisible } from 'common/state/alternativeOrder'

export function AlternativeLimitOrder() {
  const updateAlternativeOrderModalVisible = useUpdateAlternativeOrderModalVisible()

  const onDismiss = useCallback(() => updateAlternativeOrderModalVisible(false), [updateAlternativeOrderModalVisible])

  // TODO: update title according to order status: `pending ? edit : recreate`
  // TODO: pass down OR update the order placement callback directly to go back to regular mode
  return (
    <NewModal title={'Recreate order'} onDismiss={onDismiss} modalMode>
      <LimitOrdersWidget />
    </NewModal>
  )
}
