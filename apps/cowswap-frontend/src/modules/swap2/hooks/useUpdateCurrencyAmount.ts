import { useCallback } from 'react'

import { FractionUtils } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Field } from 'legacy/state/types'

import { useUpdateSwapRawState } from './useUpdateSwapRawState'

export function useUpdateCurrencyAmount() {
  const updateSwapState = useUpdateSwapRawState()

  return useCallback(
    (field: Field, value: CurrencyAmount<Currency>) => {
      updateSwapState({
        [field === Field.INPUT ? 'inputCurrencyAmount' : 'outputCurrencyAmount']:
          FractionUtils.serializeFractionToJSON(value),
      })
    },
    [updateSwapState],
  )
}
