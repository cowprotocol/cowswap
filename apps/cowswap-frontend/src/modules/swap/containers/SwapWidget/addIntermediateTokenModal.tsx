import { ReactNode, useCallback } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { useAddUserToken } from '@cowprotocol/tokens'

import styled from 'styled-components/macro'

import { ImportTokenModal, useSelectTokenWidgetState } from 'modules/tokensList'

const Wrapper = styled.div`
  width: 100%;
  max-width: 470px;
  margin: 0 auto;

  > div {
    height: calc(100vh - 200px);
    min-height: 600px;
  }
`

interface AddIntermediateTokenModalProps {
  onDismiss: () => void
  onBack: () => void
  onImport: (token: TokenWithLogo) => void
}

export function AddIntermediateTokenModal({ onDismiss, onBack, onImport }: AddIntermediateTokenModalProps): ReactNode {
  const { tokenToImport } = useSelectTokenWidgetState()
  const importTokenCallback = useAddUserToken()

  const handleImport = useCallback(() => {
    if (tokenToImport) {
      importTokenCallback([tokenToImport])
      onImport(tokenToImport)
    }
  }, [onImport, importTokenCallback, tokenToImport])

  if (!tokenToImport) {
    return null
  }

  return (
    <Wrapper>
      <ImportTokenModal tokens={[tokenToImport]} onDismiss={onDismiss} onBack={onBack} onImport={handleImport} />
    </Wrapper>
  )
}
