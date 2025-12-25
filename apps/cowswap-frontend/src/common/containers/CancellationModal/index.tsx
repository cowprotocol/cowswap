import { useAtomValue } from 'jotai'
import { ReactNode, useMemo } from 'react'

import { Command } from '@cowprotocol/types'

import { useOrder } from 'legacy/state/orders/hooks'

import { cancellationModalContextAtom } from 'common/hooks/useCancelOrder/state'
import { CancellationModal as Pure } from 'common/pure/CancellationModal'

import { computeOrderSummary } from '../../updaters/orders/utils'

export type CancellationModalProps = {
  isOpen: boolean
  onDismiss: Command
}

export function CancellationModal(props: CancellationModalProps): ReactNode {
  const { isOpen, onDismiss } = props

  const context = useAtomValue(cancellationModalContextAtom)
  const order = useOrder({ id: context.orderId || undefined, chainId: context.chainId || undefined })
  const orderSummary = useMemo(() => {
    if (!order) return undefined
    return computeOrderSummary({ orderFromStore: order, orderFromApi: order.apiAdditionalInfo })
  }, [order])

  return <Pure isOpen={isOpen} onDismiss={onDismiss} context={context} orderSummary={orderSummary} />
}
