import { useEffect, useMemo, useState } from 'react'

import { useNetworkId } from 'state/network'

import { Order } from 'api/operator'

import { resolveSolver, type OrderSolverInfo, type UseOrderSolverResult } from './orderSolverShared'

export type { OrderSolverInfo, UseOrderSolverResult } from './orderSolverShared'

export function useOrderSolver(order: Order | null): UseOrderSolverResult {
  const networkId = useNetworkId()
  const [solver, setSolver] = useState<OrderSolverInfo | undefined>()
  // Tracks which orderUid:txHash combo we finished resolving
  const [doneFor, setDoneFor] = useState<string | null>(null)

  const hasExecution = hasOrderExecution(order)
  const orderUid = order?.uid
  const txHash = order?.txHash
  const currentKey = hasExecution && orderUid && networkId ? `${networkId}:${orderUid}:${txHash || ''}` : null

  useEffect(() => {
    if (!networkId || !orderUid || !currentKey) {
      setSolver(undefined)
      setDoneFor(null)
      return
    }

    let cancelled = false

    resolveSolver(networkId, orderUid, txHash)
      .then((result) => {
        if (cancelled) return

        setSolver(result)
        setDoneFor(currentKey)
      })
      .catch(() => {
        if (cancelled) return
        setSolver(undefined)
        setDoneFor(currentKey)
      })

    return () => {
      cancelled = true
    }
  }, [networkId, orderUid, txHash, currentKey])

  // Loading if we have an order, a network, and haven't finished resolving for the current key
  const isLoading = !!currentKey && !!networkId && doneFor !== currentKey

  return useMemo(() => ({ solver, isLoading }), [solver, isLoading])
}

function hasOrderExecution(order: Order | null): boolean {
  if (!order) return false

  return !order.executedBuyAmount.isZero() || !order.executedSellAmount.isZero()
}
