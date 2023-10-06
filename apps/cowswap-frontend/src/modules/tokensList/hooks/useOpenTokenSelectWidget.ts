import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { Currency } from '@uniswap/sdk-core'

import { updateSelectTokenWidgetAtom } from '../state/selectTokenWidgetAtom'

export function useOpenTokenSelectWidget(): (
  selectedToken: string | undefined,
  onSelectToken: (currency: Currency) => void
) => void {
  const updateSelectTokenWidget = useSetAtom(updateSelectTokenWidgetAtom)

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
