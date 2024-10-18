import { useCallback } from 'react'

import { FractionUtils } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Field } from 'legacy/state/types'

import { useUpdateYieldRawState } from './useUpdateYieldRawState'

export function useUpdateCurrencyAmount() {
  const updateYieldState = useUpdateYieldRawState()

  return useCallback(
    (field: Field, value: CurrencyAmount<Currency>) => {
      updateYieldState({
        [field === Field.INPUT ? 'inputCurrencyAmount' : 'outputCurrencyAmount']:
          FractionUtils.serializeFractionToJSON(value),
      })
    },
    [updateYieldState],
  )
}
