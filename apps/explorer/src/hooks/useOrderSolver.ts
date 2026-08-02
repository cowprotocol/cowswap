import { useEffect, useMemo, useRef, useState } from 'react'

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
  const orderKey = hasExecution && orderUid && networkId ? `${networkId}:${orderUid}` : null
  const currentKey = orderKey ? `${orderKey}:${txHash || ''}` : null

  // The order page only knows the txHash once the trades have loaded, so it arrives after the first
  // resolution. Re-running the lookup then would refetch and re-render the same solver, which reads
  // as the badge loading twice. The txHash is only ever needed as a fallback when the order status
  // yields no winner, so once we have a solver the late arrival can be ignored.
  const resolvedFor = useRef<string | null>(null)

  useEffect(() => {
    if (!networkId || !orderUid || !currentKey || !orderKey) {
      setSolver(undefined)
      setDoneFor(null)
      resolvedFor.current = null
      return
    }

    if (resolvedFor.current === orderKey) {
      setDoneFor(currentKey)
      return
    }

    let cancelled = false

    resolveSolver(networkId, orderUid, txHash)
      .then((result) => {
        if (cancelled) return

        if (result) resolvedFor.current = orderKey
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
  }, [networkId, orderUid, txHash, currentKey, orderKey])

  // Loading if we have an order, a network, and haven't finished resolving for the current key
  const isLoading = !!currentKey && !!networkId && doneFor !== currentKey

  return useMemo(() => ({ solver, isLoading }), [solver, isLoading])
}

function hasOrderExecution(order: Order | null): boolean {
  if (!order) return false

  return !order.executedBuyAmount.isZero() || !order.executedSellAmount.isZero()
}
