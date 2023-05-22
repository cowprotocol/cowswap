import { Percent } from '@uniswap/sdk-core'
import { useCallback } from 'react'
import { MIN_SLIPPAGE_BPS, MAX_SLIPPAGE_BPS, LOW_SLIPPAGE_BPS, HIGH_SLIPPAGE_BPS } from 'constants/index'
import { useSetSlippage } from './useSetSlippage'

type Props = {
  setSlippageInput: React.Dispatch<React.SetStateAction<string>>
  setSlippageError: React.Dispatch<React.SetStateAction<string | null>>
  setSlippageWarning: React.Dispatch<React.SetStateAction<string | null>>
}

export function useParseSlippage({ setSlippageInput, setSlippageError, setSlippageWarning }: Props) {
  const setSlippage = useSetSlippage()

  return useCallback(
    (value: string) => {
      // populate what the user typed and clear the error
      setSlippageInput(value)
      setSlippageError(null)
      setSlippageWarning(null)

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

        setSlippage('auto')

        const errorCheck = !Number.isInteger(parsed) || parsed < MIN_SLIPPAGE_BPS || parsed > MAX_SLIPPAGE_BPS

        if (errorCheck) {
          setSlippageError(`Enter slippage value between ${MIN_SLIPPAGE_BPS}% and ${MAX_SLIPPAGE_BPS / 100}%`)
        } else {
          setSlippage(new Percent(parsed, 10_000))
        }

        if (!errorCheck) {
          if (parsed < LOW_SLIPPAGE_BPS) {
            setSlippageWarning('Your transaction may expire')
          } else if (parsed > HIGH_SLIPPAGE_BPS) {
            setSlippageWarning('High slippage amount selected')
          }
        }
      }
    },
    [setSlippage, setSlippageError, setSlippageInput, setSlippageWarning]
  )
}
