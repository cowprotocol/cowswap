import { useNavigateOnCurrencySelection } from './useNavigateOnCurrencySelection'
import { useCallback } from 'react'
import type { Field } from 'state/swap/actions'

export interface OnImportDismissCallback {
  (unknownFields: Field[]): void
}

export function useOnImportDismiss(): OnImportDismissCallback {
  const onCurrencySelection = useNavigateOnCurrencySelection()

  return useCallback(
    (unknownFields: Field[]) => {
      unknownFields.forEach((field) => onCurrencySelection(field, null))
    },
    [onCurrencySelection]
  )
}
