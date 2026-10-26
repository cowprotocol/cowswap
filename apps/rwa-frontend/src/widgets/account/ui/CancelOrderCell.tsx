'use client'

import type { ReactNode } from 'react'

import styles from './AccountTable.module.css'
import { RowMenu, type RowMenuItem } from './RowMenu'

import { useCancelOrder, useOrderCancellation } from '../model/useCancelOrder'

import type { OpenOrder } from '../api/openOrders'

import { getExplorerTxUrl } from '@/shared/lib/chain'
import { Tooltip } from '@/shared/ui/tooltip'

export function CancelOrderCell({ order }: { order: OpenOrder }): ReactNode {
  const cancellation = useOrderCancellation(order.uid)
  const cancel = useCancelOrder()

  if (cancellation?.status === 'signing') {
    return <span className={styles.secondary}>Confirm in your wallet…</span>
  }

  if (cancellation?.status === 'pending') {
    const txUrl = getExplorerTxUrl(order.chainId, cancellation.txHash)

    return txUrl ? (
      <a className={styles.link} href={txUrl} target="_blank" rel="noopener noreferrer">
        Cancelling… ↗
      </a>
    ) : (
      <span className={styles.secondary}>Cancelling…</span>
    )
  }

  if (cancellation?.status === 'cancelled') return <span className={styles.secondary}>Cancelled</span>

  const items: RowMenuItem[] = [
    ...(order.isSoftCancellable
      ? [
          {
            label: 'Cancel order',
            description: 'Free. Signs a message, the order may still fill until it is processed',
            onSelect: () => cancel(order, 'soft'),
          },
        ]
      : []),
    {
      label: 'Cancel on-chain',
      description: 'Costs gas. Sends a transaction, the order can no longer fill once it confirms',
      onSelect: () => cancel(order, 'hard'),
    },
  ]

  return (
    <>
      <RowMenu label="Order actions" items={items} />
      {cancellation?.status === 'failed' && (
        <Tooltip content={cancellation.error}>
          <span className={styles.error}>Cancellation failed</span>
        </Tooltip>
      )}
    </>
  )
}
