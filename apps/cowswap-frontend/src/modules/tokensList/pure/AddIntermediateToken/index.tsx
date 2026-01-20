import { ReactNode, useCallback } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { getTokenId } from '@cowprotocol/common-utils'

import { useAddTokenImportCallback } from 'modules/tokensList/hooks/useAddTokenImportCallback'
import { ImportTokenItem } from 'modules/tokensList/pure/ImportTokenItem'

import * as styledEl from './styled'

interface AddIntermediateTokenProps {
  intermediateBuyToken: TokenWithLogo
  onImport: () => void
}

export function AddIntermediateToken({ intermediateBuyToken, onImport }: AddIntermediateTokenProps): ReactNode {
  const addTokenImportCallback = useAddTokenImportCallback()

  const handleImport = useCallback(
    (token: TokenWithLogo) => {
      addTokenImportCallback(token)
      onImport()
    },
    [onImport, addTokenImportCallback],
  )

  return (
    <styledEl.AddIntermediateTokenWrapper>
      <ImportTokenItem key={getTokenId(intermediateBuyToken)} token={intermediateBuyToken} importToken={handleImport} />
    </styledEl.AddIntermediateTokenWrapper>
  )
}
