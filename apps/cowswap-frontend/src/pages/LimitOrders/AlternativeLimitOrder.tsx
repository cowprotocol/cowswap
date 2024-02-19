import { useCallback } from 'react'

import { LimitOrdersWidget } from 'modules/limitOrders'

import { NewModal } from 'common/pure/NewModal'
import { useHideAlternativeOrderModal } from 'common/state/alternativeOrder'

export function AlternativeLimitOrder() {
  const hideAlternativeOrderModal = useHideAlternativeOrderModal()

  const onDismiss = useCallback(() => hideAlternativeOrderModal(), [hideAlternativeOrderModal])

  return (
    <NewModal title={'Recreate order'} onDismiss={onDismiss} modalMode>
      <LimitOrdersWidget />
    </NewModal>
  )
}
