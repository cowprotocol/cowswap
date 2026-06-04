import { useEffect, useState, useTransition } from 'react'

import { useDebounce } from '@cowprotocol/common-hooks'

import { isInvalidJson, jsonHelperText } from '../utils/json-field-parsing/jsonFieldParsing'

export const JSON_ERROR_VALIDATION_DEBOUNCE_MS = 250

export interface AsyncJsonErrorState {
  error: boolean
  helperText: string
}

/**
 * Debounces JSON validation and applies it in a transition so typing stays responsive.
 */
export function useAsyncJsonError(
  value: string | null,
  delayMs = JSON_ERROR_VALIDATION_DEBOUNCE_MS,
): AsyncJsonErrorState {
  const debouncedValue = useDebounce(value, delayMs)
  const [error, setError] = useState(false)
  const [helperText, setHelperText] = useState(() => jsonHelperText(false))
  const [, startTransition] = useTransition()

  useEffect(() => {
    startTransition(() => {
      const hasError = isInvalidJson(debouncedValue)
      setError(hasError)
      setHelperText(jsonHelperText(hasError))
    })
  }, [debouncedValue])

  return { error, helperText }
}
