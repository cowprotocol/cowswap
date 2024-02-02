import { useCallback } from 'react'

import { Currency } from '@uniswap/sdk-core'

import { useUpdateSelectTokenWidgetState } from './useUpdateSelectTokenWidgetState'

export function useOpenTokenSelectWidget(): (
  selectedToken: string | undefined,
  onSelectToken: (currency: Currency) => void
) => void {
  const updateSelectTokenWidget = useUpdateSelectTokenWidgetState()

  return useCallback(
    (selectedToken, onSelectToken) => {
      updateSelectTokenWidget({
        selectedToken,
        open: true,
        onSelectToken: (currency) => {
          updateSelectTokenWidget({ open: false })
          onSelectToken(currency)
        },
      })
    },
    [updateSelectTokenWidget]
  )
}
