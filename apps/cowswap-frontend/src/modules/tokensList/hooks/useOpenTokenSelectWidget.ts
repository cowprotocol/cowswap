import { useSetAtom } from 'jotai/index'
import { useCallback } from 'react'

import { Currency } from '@uniswap/sdk-core'

import { updateSelectTokenWidgetAtom } from '../state/selectTokenWidgetAtom'

export function useOpenTokenSelectWidget(): (onSelectToken: (currency: Currency) => void) => void {
  const updateSelectTokenWidget = useSetAtom(updateSelectTokenWidgetAtom)

  return useCallback(
    (onSelectToken) => {
      updateSelectTokenWidget({
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
