import { useCallback, useEffect, useRef, useState } from 'react'

export function useIsPriceChanged(inputAmount: string | undefined, outputAmount: string | undefined) {
  const initialAmounts = useRef<{ inputAmount?: string; outputAmount?: string }>()

  const [isPriceChanged, setIsPriceChanged] = useState(false)

  const resetPriceChanged = useCallback(() => {
    initialAmounts.current = { inputAmount, outputAmount }
    setIsPriceChanged(false)
  }, [inputAmount, outputAmount])

  useEffect(() => {
    resetPriceChanged()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!initialAmounts.current) return

    if (inputAmount !== initialAmounts.current.inputAmount || outputAmount !== initialAmounts.current.outputAmount) {
      setIsPriceChanged(true)
    }
  }, [inputAmount, outputAmount])

  return { isPriceChanged, resetPriceChanged }
}
