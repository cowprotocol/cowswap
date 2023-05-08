import { Percent } from '@uniswap/sdk-core'
import { useCallback } from 'react'
import { MIN_SLIPPAGE_BPS, MAX_SLIPPAGE_BPS } from 'constants/index'
import { SlippageError } from '@cow/modules/advancedOrders/state/advancedOrdersSettingsAtom'
import { useSetSlippage } from './useSetSlippage'

export function useParseSlippage(
  setSlippageInput: React.Dispatch<React.SetStateAction<string>>,
  setSlippageError: React.Dispatch<React.SetStateAction<false | SlippageError>>
) {
  const setSlippage = useSetSlippage()

  return useCallback(
    (value: string) => {
      // populate what the user typed and clear the error
      setSlippageInput(value)
      setSlippageError(false)

      if (value.length === 0) {
        setSlippage('auto')
      } else {
        let v = value

        // Prevent inserting more than 2 decimal precision
        if (value.split('.')[1]?.length > 2) {
          // indexOf + 3 because we are cutting it off at `.XX`
          v = value.slice(0, value.indexOf('.') + 3)
          // Update the input to remove the extra numbers from UI input
          setSlippageInput(v)
        }

        const parsed = Math.round(Number.parseFloat(v) * 100)

        if (!Number.isInteger(parsed) || parsed < MIN_SLIPPAGE_BPS || parsed > MAX_SLIPPAGE_BPS) {
          setSlippage('auto')
          setSlippageError(v !== '.' ? SlippageError.InvalidInput : false)
        } else {
          setSlippage(new Percent(parsed, 10_000))
        }
      }
    },
    [setSlippage, setSlippageError, setSlippageInput]
  )
}
