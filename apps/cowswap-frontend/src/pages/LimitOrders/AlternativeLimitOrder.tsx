import { useCallback } from 'react'

import { LimitOrdersWidget } from 'modules/limitOrders'
import { useHideAlternativeOrderModal } from 'modules/trade/state/alternativeOrder'

import { NewModal } from 'common/pure/NewModal'

export function AlternativeLimitOrder() {
  const hideAlternativeOrderModal = useHideAlternativeOrderModal()

  const onDismiss = useCallback(() => hideAlternativeOrderModal(), [hideAlternativeOrderModal])

  return (
    <NewModal title={'Recreate order'} onDismiss={onDismiss} modalMode>
      <LimitOrdersWidget />
    </NewModal>
  )
}
