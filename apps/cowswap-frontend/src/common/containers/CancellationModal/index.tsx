import { useAtomValue } from 'jotai'
import { ReactNode, useMemo } from 'react'

import { Command } from '@cowprotocol/types'

import { cancellationModalContextAtom } from 'common/hooks/useCancelOrder/state'
import { CancellationModal as Pure } from 'common/pure/CancellationModal'

import { useUltimateOrder } from '../../hooks/useUltimateOrder'
import { computeOrderSummary } from '../../updaters/orders/utils'

export type CancellationModalProps = {
  isOpen: boolean
  onDismiss: Command
}

export function CancellationModal(props: CancellationModalProps): ReactNode {
  const { isOpen, onDismiss } = props

  const context = useAtomValue(cancellationModalContextAtom)
  const ultimateOrder = useUltimateOrder(context.chainId || undefined, context.orderId || undefined)

  const orderSummary = useMemo(() => {
    if (!ultimateOrder) return undefined
    return computeOrderSummary(ultimateOrder)
  }, [ultimateOrder])

  return <Pure isOpen={isOpen} onDismiss={onDismiss} context={context} orderSummary={orderSummary} />
}
