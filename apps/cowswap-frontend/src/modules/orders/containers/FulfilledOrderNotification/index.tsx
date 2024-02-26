import { useCallback, useMemo } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useOrder } from 'legacy/state/orders/hooks'

import { parseOrder } from 'utils/orderUtils/parseOrder'

import { ExecutedSummary } from '../ExecutedSummary'

interface FulfilledOrderNotificationProps {
  uid: string
  chainId: SupportedChainId
  onToastMessage(message: string): void
}
export function FulfilledOrderNotification({ chainId, uid, onToastMessage }: FulfilledOrderNotificationProps) {
  const ref = useCallback(
    (node: HTMLDivElement) => {
      if (node) onToastMessage(node.innerText)
    },
    [onToastMessage]
  )

  const order = useOrder({ chainId, id: uid })
  const parsedOrder = useMemo(() => (order ? parseOrder(order) : undefined), [order])

  if (!parsedOrder) return null

  return <ExecutedSummary ref={ref} order={parsedOrder} />
}
