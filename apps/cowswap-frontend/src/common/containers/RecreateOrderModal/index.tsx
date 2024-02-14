import { useCallback } from 'react'

import { RecreateOrderModal as Pure } from 'common/pure/RecreateOrderModal'
import {
  useGetOrderToRecreate,
  useIsRecreateOrderModalVisible,
  useUpdateRecreateOrderModalVisible,
} from 'common/state/recreateOrder'

export function RecreateOrderModal() {
  const isRecreateOrderModalVisible = useIsRecreateOrderModalVisible()
  const orderToRecreate = useGetOrderToRecreate()
  const updateRecreateOrderModalVisible = useUpdateRecreateOrderModalVisible()

  const onDismiss = useCallback(() => updateRecreateOrderModalVisible(false), [updateRecreateOrderModalVisible])

  if (!isRecreateOrderModalVisible) {
    return null
  }

  // TODO: use TradeWidget? LimitOrderWidget?
  return <Pure onDismiss={onDismiss}>{orderToRecreate?.id}</Pure>
}
