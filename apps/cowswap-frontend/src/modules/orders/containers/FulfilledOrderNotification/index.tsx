import { useMemo } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useOrder } from 'legacy/state/orders/hooks'

import { parseOrder } from 'utils/orderUtils/parseOrder'

import { ExecutedSummary } from '../ExecutedSummary'

interface FulfilledOrderNotificationProps {
  uid: string
  chainId: SupportedChainId
}
export function FulfilledOrderNotification({ chainId, uid }: FulfilledOrderNotificationProps) {
  const order = useOrder({ chainId, id: uid })
  const parsedOrder = useMemo(() => (order ? parseOrder(order) : undefined), [order])

  if (!parsedOrder) return null

  return <ExecutedSummary order={parsedOrder} />
}
