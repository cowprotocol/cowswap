import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { isAddress, isTruthy } from '@cowprotocol/common-utils'

import { tokenListsUpdatingAtom } from '../../state/tokenLists/tokenListsStateAtom'
import { useTokensByAddressMap } from './useTokensByAddressMap'
import { useSearchToken } from './useSearchToken'

export function useSearchNonExistentToken(tokenAddress: string | null): TokenWithLogo | null {
  const tokenListsUpdating = useAtomValue(tokenListsUpdatingAtom)
  const allTokens = useTokensByAddressMap()

  const isNotAddress = !isAddress(tokenAddress)
  const existingToken = tokenAddress ? allTokens[tokenAddress.toLowerCase()] : null

  const inputTokenToSearch = tokenListsUpdating || existingToken || !tokenAddress || isNotAddress ? null : tokenAddress

  const foundToken = useSearchToken(inputTokenToSearch)

  return useMemo(() => {
    if (!inputTokenToSearch) return null

    return (
      [foundToken.inactiveListsResult, foundToken.externalApiResult, foundToken.blockchainResult]
        .filter(isTruthy)
        .flat()
        .filter(isTruthy)[0] || null
    )
  }, [inputTokenToSearch, foundToken])
}
