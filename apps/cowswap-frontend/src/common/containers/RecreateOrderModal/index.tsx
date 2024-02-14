import { useCallback } from 'react'

import { RecreateOrderModal as Pure } from 'common/pure/RecreateOrderModal'
import {
  useGetAlternativeOrder,
  useIsAlternativeOrderModalVisible,
  useUpdateAlternativeOrderModalVisible,
} from 'common/state/alternativeOrder'

export function RecreateOrderModal() {
  const isRecreateOrderModalVisible = useIsAlternativeOrderModalVisible()
  const orderToRecreate = useGetAlternativeOrder()
  const updateRecreateOrderModalVisible = useUpdateAlternativeOrderModalVisible()

  const onDismiss = useCallback(() => updateRecreateOrderModalVisible(false), [updateRecreateOrderModalVisible])

  if (!isRecreateOrderModalVisible) {
    return null
  }

  // TODO: use TradeWidget? LimitOrderWidget?
  return <Pure onDismiss={onDismiss}>{orderToRecreate?.id}</Pure>
}
