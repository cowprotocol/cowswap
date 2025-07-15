import { ReactNode, useCallback, useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { useSearchToken } from '@cowprotocol/tokens'
import { Loader } from '@cowprotocol/ui'

import { useAddTokenImportCallback } from 'modules/tokensList/hooks/useAddTokenImportCallback'
import { ImportTokenItem } from 'modules/tokensList/pure/ImportTokenItem'

import * as styledEl from './styled'

interface AddIntermediateTokenProps {
  intermediateBuyTokenAddress: string
  onImport: () => void
}

export function AddIntermediateToken({ intermediateBuyTokenAddress, onImport }: AddIntermediateTokenProps): ReactNode {
  const addTokenImportCallback = useAddTokenImportCallback()
  const searchResults = useSearchToken(intermediateBuyTokenAddress)

  const { inactiveListsResult, blockchainResult, activeListsResult, externalApiResult, isLoading } = searchResults

  const handleImport = useCallback(
    (token: TokenWithLogo) => {
      addTokenImportCallback(token)
      onImport()
    },
    [onImport, addTokenImportCallback],
  )

  const allTokens = useMemo(() => {
    const allTokensMap = [
      ...inactiveListsResult,
      ...blockchainResult,
      ...activeListsResult,
      ...externalApiResult,
    ].reduce((map, token) => {
      const addressLower = token.address.toLowerCase()
      if (!map.has(addressLower)) {
        map.set(addressLower, token)
      }
      return map
    }, new Map<string, TokenWithLogo>())
    return Array.from(allTokensMap.values())
  }, [inactiveListsResult, blockchainResult, activeListsResult, externalApiResult])

  return (
    <styledEl.AddIntermediateTokenWrapper>
      {isLoading && (
        <styledEl.LoaderWrapper>
          <Loader />
        </styledEl.LoaderWrapper>
      )}
      {!isLoading && allTokens.length === 0 && <div>No tokens found for the given address</div>}
      {allTokens.map((token) => {
        return <ImportTokenItem key={token.address} token={token} importToken={handleImport} />
      })}
    </styledEl.AddIntermediateTokenWrapper>
  )
}
