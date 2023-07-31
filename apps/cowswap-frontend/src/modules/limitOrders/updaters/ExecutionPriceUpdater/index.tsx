import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { useLimitOrdersDerivedState } from 'modules/limitOrders/hooks/useLimitOrdersDerivedState'
import { executionPriceAtom } from 'modules/limitOrders/state/executionPriceAtom'
import { limitRateAtom } from 'modules/limitOrders/state/limitRateAtom'

import { calculateExecutionPrice } from 'utils/orderUtils/calculateExecutionPrice'

export function ExecutionPriceUpdater() {
  const { marketRate, feeAmount } = useAtomValue(limitRateAtom)
  const { inputCurrencyAmount, outputCurrencyAmount, orderKind } = useLimitOrdersDerivedState()
  const setExecutionPrice = useSetAtom(executionPriceAtom)

  const price = calculateExecutionPrice({
    inputCurrencyAmount,
    outputCurrencyAmount,
    feeAmount,
    marketRate,
    orderKind,
  })

  useEffect(() => {
    setExecutionPrice(price)
  }, [price, setExecutionPrice])

  return null
}
