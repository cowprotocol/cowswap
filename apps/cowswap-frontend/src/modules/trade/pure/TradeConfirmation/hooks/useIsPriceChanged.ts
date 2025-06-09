import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useIsPriceChanged(
  inputAmount: string | undefined,
  outputAmount: string | undefined,
  defaultState: boolean = false,
) {
  const initialAmounts = useRef<{ inputAmount?: string; outputAmount?: string }>({})
  const [isPriceChanged, setIsPriceChanged] = useState(false)
  const [hasInitialized, setHasInitialized] = useState(false)

  const resetPriceChanged = useCallback(() => {
    initialAmounts.current = { inputAmount, outputAmount }
    setIsPriceChanged(false)
    setHasInitialized(true)
  }, [inputAmount, outputAmount])

  // Initialize on first render with current amounts
  useEffect(() => {
    if (!hasInitialized && inputAmount && outputAmount) {
      resetPriceChanged()
    }
  }, [inputAmount, outputAmount, hasInitialized, resetPriceChanged])

  // Only check for price changes after initialization
  useEffect(() => {
    if (!hasInitialized || !initialAmounts.current) {
      return
    }

    const { inputAmount: initialInputAmount, outputAmount: initialOutputAmount } = initialAmounts.current

    // Only trigger price changed if we have valid initial amounts and they actually differ
    if (
      initialInputAmount &&
      initialOutputAmount &&
      inputAmount &&
      outputAmount &&
      (inputAmount !== initialInputAmount || outputAmount !== initialOutputAmount)
    ) {
      setIsPriceChanged(true)
    }
  }, [inputAmount, outputAmount, hasInitialized])

  // Handle forcePriceConfirmation only if there's an actual price difference
  useEffect(() => {
    if (defaultState && hasInitialized) {
      const { inputAmount: initialInputAmount, outputAmount: initialOutputAmount } = initialAmounts.current

      // Only set price changed if there's actually a difference
      if (
        initialInputAmount &&
        initialOutputAmount &&
        inputAmount &&
        outputAmount &&
        (inputAmount !== initialInputAmount || outputAmount !== initialOutputAmount)
      ) {
        setIsPriceChanged(true)
      }
    }
  }, [defaultState, inputAmount, outputAmount, hasInitialized])

  const result = useMemo(() => {
    return { isPriceChanged, resetPriceChanged }
  }, [isPriceChanged, resetPriceChanged])

  return result
}
