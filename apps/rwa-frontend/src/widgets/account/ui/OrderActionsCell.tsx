'use client'

import type { ReactNode } from 'react'

import styles from './AccountTable.module.css'
import { RowMenu, type RowMenuItem } from './RowMenu'

import { useCancelOrder, useOrderCancellation } from '../model/useCancelOrder'

import type { CancellationType } from '../api/cancelOrder'
import type { OpenOrder } from '../api/openOrders'

import { getCowExplorerOrderUrl, getCowExplorerTwapUrl, getExplorerTxUrl } from '@/shared/lib/chain'
import { LinkIcon, TrashIcon } from '@/shared/ui/icons'
import { Tooltip } from '@/shared/ui/tooltip'

const SOLVER_CAVEAT =
  'Keep in mind a solver might already have included the order in a solution even if this cancellation is successful.'
const CANCELLATION_DESCRIPTIONS: Record<CancellationType, string> = {
  soft: `Requires a signature and is free.\n${SOLVER_CAVEAT}`,
  hard: `Requires an on-chain transaction and costs gas.\n${SOLVER_CAVEAT}`,
}

export function OrderActionsCell({ order }: { order: OpenOrder }): ReactNode {
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

  const explorerUrl = getOrderExplorerUrl(order)
  const items: RowMenuItem[] = [
    ...(explorerUrl
      ? [
          {
            label: 'View on explorer',
            icon: <LinkIcon />,
            onSelect: () => window.open(explorerUrl, '_blank', 'noopener,noreferrer'),
          },
        ]
      : []),
    ...getCancelItems(order, (type) => cancel(order, type)),
  ]

  if (!items.length) return null

  return (
    <>
      <RowMenu label="Order actions" items={items} />
      {cancellation?.status === 'failed' && (
        <Tooltip className={styles.error} content={cancellation.error}>
          Cancellation failed
        </Tooltip>
      )}
    </>
  )
}

function cancelItem(label: string, type: CancellationType, cancel: (type: CancellationType) => void): RowMenuItem {
  return {
    label,
    icon: <TrashIcon />,
    description: CANCELLATION_DESCRIPTIONS[type],
    onSelect: () => cancel(type),
  }
}

function getCancelItems(order: OpenOrder, cancel: (type: CancellationType) => void): RowMenuItem[] {
  // The UID cancellations don't stop a TWAP. A Safe's TWAP is cancelled in the trade widget
  if (order.type === 'twap') return order.cowShedTwap ? [cancelItem('Cancel on-chain', 'hard', cancel)] : []

  return [
    ...(order.isSoftCancellable ? [cancelItem('Cancel off-chain', 'soft', cancel)] : []),
    cancelItem('Cancel on-chain', 'hard', cancel),
  ]
}

function getOrderExplorerUrl({ type, chainId, uid }: OpenOrder): string | null {
  return (type === 'twap' && getCowExplorerTwapUrl(chainId, uid)) || getCowExplorerOrderUrl(chainId, uid)
}
