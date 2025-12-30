import { useAtomValue } from 'jotai'
import React, { ReactNode, useMemo } from 'react'

import { Command } from '@cowprotocol/types'

import { cancellationModalContextAtom } from 'common/hooks/useCancelOrder/state'
import { CancellationModal as Pure } from 'common/pure/CancellationModal'
import { OrderSummary } from 'common/pure/OrderSummary'

import { useUltimateOrder } from '../../hooks/useUltimateOrder'
import { getUltimateOrderTradeAmounts } from '../../updaters/orders/utils'

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

    const { inputAmount, outputAmount } = getUltimateOrderTradeAmounts(ultimateOrder)

    return (
      <OrderSummary inputAmount={inputAmount} outputAmount={outputAmount} kind={ultimateOrder.orderFromStore.kind} />
    )
  }, [ultimateOrder])

  return <Pure isOpen={isOpen} onDismiss={onDismiss} context={context} orderSummary={orderSummary} />
}
