import { useMemo } from 'react'
import { useSlippage } from './useSlippage'

export function useDisplaySlippageValue(value: string) {
  const slippage = useSlippage()

  return useMemo(() => {
    if (value.length > 0) {
      return value
    } else if (slippage === 'auto') {
      return ''
    } else {
      return slippage.toFixed(2)
    }
  }, [value, slippage])
}
