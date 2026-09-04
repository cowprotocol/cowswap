import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { doesTokenMatchSymbolOrAddress } from '@cowprotocol/common-utils'

import { useSearchToken } from './useSearchToken'
import { useTokenBySymbolOrAddress } from './useTokenBySymbolOrAddress'
import { useTokensByAddressMap } from './useTokensByAddressMap'

import { tokenListsUpdatingAtom } from '../../state/tokenLists/tokenListsStateAtom'
import { excludeAlreadyActiveTokens } from '../../utils/tokenIdentity'

export function useSearchNonExistentToken(tokenId: string | null): TokenWithLogo | null {
  const tokenListsUpdating = useAtomValue(tokenListsUpdatingAtom)
  const tokensByAddress = useTokensByAddressMap()

  const existingToken = useTokenBySymbolOrAddress(tokenId)

  const inputTokenToSearch = tokenListsUpdating || existingToken ? null : tokenId

  const foundToken = useSearchToken(inputTokenToSearch)

  return useMemo(() => {
    if (!inputTokenToSearch) return null

    const matches = [foundToken.inactiveListsResult, foundToken.externalApiResult, foundToken.blockchainResult]
      .flat()
      .filter((token) => !!token && doesTokenMatchSymbolOrAddress(token, inputTokenToSearch))

    // An address that is already active needs no import. Without this, a symbol that only exists in an
    // inactive list keeps resolving to an importable token even though the address is already tradable,
    // and the import prompt reopens every time the user-added copy is pruned as a duplicate.
    return excludeAlreadyActiveTokens(matches, tokensByAddress)[0] || null
  }, [inputTokenToSearch, foundToken, tokensByAddress])
}
