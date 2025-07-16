import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface PriceChangedResult {
  isPriceChanged: boolean
  resetPriceChanged(): void
}

export function useIsPriceChanged(
  inputAmount: string | undefined,
  outputAmount: string | undefined,
  defaultState: boolean = false,
): PriceChangedResult {
  const initialAmounts = useRef<{ inputAmount?: string; outputAmount?: string }>({})

  const [isPriceChanged, setIsPriceChanged] = useState(defaultState)

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

    const { inputAmount: initialInputAmount, outputAmount: initialOutputAmount } = initialAmounts.current

    if (inputAmount !== initialInputAmount || outputAmount !== initialOutputAmount) {
      setIsPriceChanged(true)
    }
  }, [inputAmount, outputAmount])

  useEffect(() => {
    setIsPriceChanged(defaultState)
  }, [defaultState])

  return useMemo(() => ({ isPriceChanged, resetPriceChanged }), [isPriceChanged, resetPriceChanged])
}
