import { ChangeEvent, useCallback, useEffect, useState } from 'react'

import { isPrefixedAddress, parsePrefixedAddress } from '@cowprotocol/common-utils'

import { AddressValidationStrategy } from '../../../utils/addressValidation'

export function useOnAddressInput(
  onChange: (value: string) => void,
  addressPrefix: string | undefined,
  strategy: AddressValidationStrategy,
): { handleInput: (event: ChangeEvent<HTMLInputElement>) => void; chainPrefixWarning: string } {
  const [chainPrefixWarning, setChainPrefixWarning] = useState('')

  const handleInput = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const input = event.target.value
      setChainPrefixWarning('')
      let parsed = input.replace(/\s+/g, '')

      if (strategy.supportsChainPrefix && isPrefixedAddress(parsed)) {
        const { prefix, address: prefixedAddr } = parsePrefixedAddress(parsed)

        if (prefix && addressPrefix !== prefix) {
          setChainPrefixWarning(prefix)
        }

        if (prefixedAddr) {
          parsed = prefixedAddr
        }
      }

      onChange(parsed)
    },
    [onChange, addressPrefix, strategy],
  )

  useEffect(() => {
    if (chainPrefixWarning && chainPrefixWarning === addressPrefix) {
      setChainPrefixWarning('')
    }
  }, [chainPrefixWarning, addressPrefix])

  return { handleInput, chainPrefixWarning }
}
