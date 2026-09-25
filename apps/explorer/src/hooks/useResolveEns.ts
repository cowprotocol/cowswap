import { useState, useEffect } from 'react'

import { isSolanaAddress, isSolanaChain } from '@cowprotocol/cow-sdk'

import { useNetworkId } from 'state/network'
import { isEns } from 'utils'
import { isAddress } from 'web3-utils'

import { web3 } from '../explorer/api'

interface AddressAccount {
  address: string | null
  ens?: string
}

export function useResolveEns(address: string | undefined): AddressAccount | undefined {
  const networkId = useNetworkId()
  const [addressAccount, setAddressAccount] = useState<AddressAccount | undefined>()
  const isSolana = networkId !== null && isSolanaChain(networkId)

  useEffect(() => {
    // The network selector keeps the /address/ path when switching chains, so an ENS lookup started
    // on an EVM chain can land after the page has already moved to Solana.
    let isStale = false

    async function _resolveENS(name: string): Promise<void> {
      const _address = await resolveENS(name)

      if (isStale) return

      setAddressAccount({ address: _address, ens: name })
    }

    setAddressAccount(undefined)

    // An address of either family is accepted whatever the selected chain: the page then reports
    // which chain its orders are on, rather than sending the user somewhere else.
    if (address && !isSolana && isEns(address)) {
      _resolveENS(address)
    } else if (address && (isSolanaAddress(address) || isAddress(address))) {
      setAddressAccount({ address })
    } else {
      setAddressAccount({ address: null })
    }

    return () => {
      isStale = true
    }
  }, [address, isSolana])

  return addressAccount
}

async function resolveENS(name: string): Promise<string | null> {
  if (!web3) return null

  try {
    const address = await web3.eth.ens.getAddress(name)
    return address && address.length > 0 ? address : null
  } catch (e) {
    console.error(`[web3:api] Could not resolve ${name} ENS. `, e)
    return null
  }
}
