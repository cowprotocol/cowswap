import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import {
  doesTokenMatchSymbolOrAddress,
  isAddress,
  isPrefixedAddress,
  parsePrefixedAddress,
} from '@cowprotocol/common-utils'
import { getAddressKey } from '@cowprotocol/cow-sdk'

import { useSearchToken } from './useSearchToken'
import { useTokenBySymbolOrAddress } from './useTokenBySymbolOrAddress'
import { useTokensByAddressMap } from './useTokensByAddressMap'

import { tokenListsUpdatingAtom } from '../../state/tokenLists/tokenListsStateAtom'

export function useSearchNonExistentToken(tokenId: string | null): TokenWithLogo | null {
  const tokenListsUpdating = useAtomValue(tokenListsUpdatingAtom)
  const tokensByAddress = useTokensByAddressMap()

  const existingToken = useTokenBySymbolOrAddress(tokenId)

  const inputTokenToSearch = tokenListsUpdating || existingToken ? null : tokenId

  const foundToken = useSearchToken(inputTokenToSearch)

  return useMemo(() => {
    if (!inputTokenToSearch) return null

    if (foundToken.isLoading) return null

    const lookupKey = getAddressKeyForLookup(inputTokenToSearch)
    if (lookupKey && tokensByAddress[lookupKey]) {
      return null
    }

    if (foundToken.activeListsResult.some((token) => doesTokenMatchSymbolOrAddress(token, inputTokenToSearch))) {
      return null
    }

    const candidate =
      [foundToken.inactiveListsResult, foundToken.externalApiResult, foundToken.blockchainResult]
        .flat()
        .filter((token) => !!token && doesTokenMatchSymbolOrAddress(token, inputTokenToSearch))[0] || null

    if (!candidate) return null

    if (tokensByAddress[candidate.address.toLowerCase()]) {
      return null
    }

    return candidate
  }, [inputTokenToSearch, foundToken, tokensByAddress])
}

function getAddressKeyForLookup(raw: string): string | undefined {
  const asAddr = isAddress(raw)
  if (asAddr) return getAddressKey(asAddr)
  if (isPrefixedAddress(raw)) {
    return getAddressKey(parsePrefixedAddress(raw).address)
  }
  return undefined
}
