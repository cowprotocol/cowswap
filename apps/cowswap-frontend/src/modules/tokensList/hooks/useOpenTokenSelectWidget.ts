import { useCallback } from 'react'

import { LpToken, TokenWithLogo } from '@cowprotocol/common-const'
import { Currency } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { Field } from 'legacy/state/types'

import { useUpdateSelectTokenWidgetState } from './useUpdateSelectTokenWidgetState'
import { useCloseTokenSelectWidget } from './useCloseTokenSelectWidget'

export function useOpenTokenSelectWidget(): (
  selectedToken: Nullish<Currency>,
  field: Field | undefined,
  oppositeToken: TokenWithLogo | LpToken | Currency | undefined,
  onSelectToken: (currency: Currency) => void,
) => void {
  const updateSelectTokenWidget = useUpdateSelectTokenWidgetState()
  const closeTokenSelectWidget = useCloseTokenSelectWidget()

  return useCallback(
    (selectedToken, field, oppositeToken, onSelectToken) => {
      updateSelectTokenWidget({
        selectedToken,
        field,
        oppositeToken,
        open: true,
        onSelectToken: (currency) => {
          closeTokenSelectWidget()
          onSelectToken(currency)
        },
      })
    },
    [closeTokenSelectWidget],
  )
}
