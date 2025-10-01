import { ReactNode, useMemo } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { getOrdersPageChunk } from './services/getOrdersPageChunk'
import { OrderToCheckFillability } from './types'
import { UnfillableOrderUpdater } from './updaters/UnfillableOrderUpdater'

interface UnfillableOrdersUpdaterProps {
  orders: OrderToCheckFillability[]
  pageSize: number
  pageNumber: number
}

/**
 * Updater that checks whether pending orders are still "fillable"
 */
export function UnfillableOrdersUpdater({ orders, pageSize, pageNumber }: UnfillableOrdersUpdaterProps): ReactNode {
  const { chainId } = useWalletInfo()

  const ordersChunk = useMemo(() => {
    const chunk = getOrdersPageChunk(orders, pageSize, pageNumber)

    console.debug(`[UnfillableOrderUpdater] orders to update: ${chunk.length}`, {
      chunk,
    })

    return chunk
  }, [orders, pageSize, pageNumber])

  return (
    <>
      {ordersChunk.map((order) => {
        return <UnfillableOrderUpdater key={order.id} chainId={chainId} order={order} />
      })}
    </>
  )
}
