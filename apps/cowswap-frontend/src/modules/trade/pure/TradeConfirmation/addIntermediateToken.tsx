import { ReactNode, useCallback } from 'react'

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

  return (
    <styledEl.AddIntermediateTokenWrapper>
      {isLoading && (
        <styledEl.LoaderWrapper>
          <Loader />
        </styledEl.LoaderWrapper>
      )}
      {inactiveListsResult.map((token) => {
        return <ImportTokenItem key={token.address} token={token} importToken={handleImport} />
      })}
      {blockchainResult.map((token) => {
        return <ImportTokenItem key={token.address} token={token} importToken={handleImport} />
      })}
      {activeListsResult.map((token) => {
        return <ImportTokenItem key={token.address} token={token} importToken={handleImport} />
      })}
      {externalApiResult.map((token) => {
        return <ImportTokenItem key={token.address} token={token} importToken={handleImport} />
      })}
    </styledEl.AddIntermediateTokenWrapper>
  )
}
