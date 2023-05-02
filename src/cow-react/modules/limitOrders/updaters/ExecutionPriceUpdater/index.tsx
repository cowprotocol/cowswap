import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { executionPriceAtom } from '@cow/modules/limitOrders/state/executionPriceAtom'
import { calculateExecutionPrice } from '@cow/modules/limitOrders/utils/calculateExecutionPrice'
import { limitRateAtom } from '@cow/modules/limitOrders/state/limitRateAtom'
import { useLimitOrdersFullState } from '@cow/modules/limitOrders/hooks/useLimitOrdersFullState'
import { useEffect } from 'react'

export function ExecutionPriceUpdater() {
  const { marketRate, feeAmount } = useAtomValue(limitRateAtom)
  const { inputCurrencyAmount, outputCurrencyAmount, orderKind } = useLimitOrdersFullState()
  const setExecutionPrice = useUpdateAtom(executionPriceAtom)

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
