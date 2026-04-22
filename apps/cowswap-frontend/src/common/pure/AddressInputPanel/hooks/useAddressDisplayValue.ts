import { useCallback, useState } from 'react'

import { shortenAddress } from '@cowprotocol/common-utils'

import { autofocus } from '../../../utils/autofocus'

interface AddressDisplayValue {
  displayValue: string
  handleFocus: (e: React.FocusEvent<HTMLInputElement>) => void
  handleBlur: () => void
}

export function useAddressDisplayValue(value: string, isValid: boolean, loading: boolean): AddressDisplayValue {
  const [isFocused, setIsFocused] = useState(false)

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)
    autofocus(e)
  }, [])

  const handleBlur = useCallback(() => {
    setIsFocused(false)
  }, [])

  const displayValue = (() => {
    if (isFocused || !isValid || loading) return value
    try {
      return shortenAddress(value, 6)
    } catch {
      return value
    }
  })()

  return { displayValue, handleFocus, handleBlur }
}
