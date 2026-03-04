import { useEffect, useMemo, useState } from 'react'

import { useNetworkId } from 'state/network'

import { resolveSolverByTxHash, type OrderSolverInfo, type UseOrderSolverResult } from './orderSolverShared'

export function useTradeSolver(txHash: string | undefined | null): UseOrderSolverResult {
  const networkId = useNetworkId()
  const [solver, setSolver] = useState<OrderSolverInfo | undefined>()
  const [doneFor, setDoneFor] = useState<string | null>(null)

  const currentKey = txHash && networkId ? `${networkId}:${txHash}` : null

  useEffect(() => {
    if (!networkId || !txHash || !currentKey) {
      setSolver(undefined)
      setDoneFor(null)
      return
    }

    let cancelled = false

    resolveSolverByTxHash(networkId, txHash)
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
  }, [networkId, txHash, currentKey])

  const isLoading = !!currentKey && !!networkId && doneFor !== currentKey

  return useMemo(() => ({ solver, isLoading }), [solver, isLoading])
}
