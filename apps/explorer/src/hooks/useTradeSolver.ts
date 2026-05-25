import { useEffect, useMemo, useState } from 'react'

import { Nullish } from '@cowprotocol/cow-sdk'

import { useNetworkId } from 'state/network'

import { type OrderSolverInfo, resolveSolverByTxHash, type UseOrderSolverResult } from './orderSolverShared'

export function useTradeSolver(txHash: Nullish<string>, orderId: Nullish<string>): UseOrderSolverResult {
  const networkId = useNetworkId()
  const [solver, setSolver] = useState<OrderSolverInfo | undefined>()
  const [doneFor, setDoneFor] = useState<string | null>(null)

  const currentKey = txHash && networkId && orderId ? `${networkId}:${txHash}:${orderId}` : null

  useEffect(() => {
    if (!networkId || !txHash || !currentKey) {
      setSolver(undefined)
      setDoneFor(null)
      return
    }

    let cancelled = false

    resolveSolverByTxHash(networkId, txHash, orderId || '')
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
  }, [networkId, txHash, currentKey, orderId])

  const isLoading = !!currentKey && !!networkId && doneFor !== currentKey

  return useMemo(() => ({ solver, isLoading }), [solver, isLoading])
}
