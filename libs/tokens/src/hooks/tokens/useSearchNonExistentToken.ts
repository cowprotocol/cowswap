import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { doesTokenMatchSymbolOrAddress } from '@cowprotocol/common-utils'

import { useSearchToken } from './useSearchToken'
import { useTokenBySymbolOrAddress } from './useTokenBySymbolOrAddress'

import { tokenListsUpdatingAtom } from '../../state/tokenLists/tokenListsStateAtom'

export function useSearchNonExistentToken(tokenId: string | null): TokenWithLogo | null {
  const tokenListsUpdating = useAtomValue(tokenListsUpdatingAtom)

  const existingToken = useTokenBySymbolOrAddress(tokenId)

  const inputTokenToSearch = tokenListsUpdating || existingToken ? null : tokenId

  const foundToken = useSearchToken(inputTokenToSearch)

  return useMemo(() => {
    if (!inputTokenToSearch) return null

    return (
      [foundToken.inactiveListsResult, foundToken.externalApiResult, foundToken.blockchainResult]
        .flat()
        .filter((token) => !!token && doesTokenMatchSymbolOrAddress(token, inputTokenToSearch))[0] || null
    )
  }, [inputTokenToSearch, foundToken])
}
