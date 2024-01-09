import { isAddress } from 'web3-utils'
import { useState, useEffect } from 'react'
import { isEns } from 'utils'
import { resolveENS } from './useSearchSubmit'

interface AddressAccount {
  address: string | null
  ens?: string
}

export function useResolveEns(address: string): AddressAccount | undefined {
  const [addressAccount, setAddressAccount] = useState<AddressAccount | undefined>()

  useEffect(() => {
    async function _resolveENS(name: string): Promise<void> {
      const _address = await resolveENS(name)
      setAddressAccount({ address: _address, ens: name })
    }

    setAddressAccount(undefined)
    if (isEns(address)) {
      _resolveENS(address)
    } else if (isAddress(address)) {
      setAddressAccount({ address })
    } else {
      setAddressAccount({ address: null })
    }
  }, [address])

  return addressAccount
}
