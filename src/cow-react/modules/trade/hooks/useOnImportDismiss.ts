import { useOnCurrencySelection } from './useOnCurrencySelection'
import { useCallback } from 'react'
import type { Field } from 'state/swap/actions'

export function useOnImportDismiss() {
  const onCurrencySelection = useOnCurrencySelection()

  return useCallback(
    (unknownFields: Field[]) => {
      unknownFields.forEach((field) => onCurrencySelection(field, null))
    },
    [onCurrencySelection]
  )
}
