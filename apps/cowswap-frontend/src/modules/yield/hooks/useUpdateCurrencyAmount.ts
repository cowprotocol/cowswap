import { useCallback } from 'react'

import { FractionUtils } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Field } from 'legacy/state/types'

import { useUpdateYieldRawState } from './useUpdateYieldRawState'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
