import { ReactNode, useCallback } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { useAddUserToken } from '@cowprotocol/tokens'

import styled from 'styled-components/macro'

import { ImportTokenModal, useSelectTokenWidgetState } from 'modules/tokensList'
import { useCloseTokenSelectWidget } from 'modules/tokensList/hooks/useCloseTokenSelectWidget'

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
  const closeTokenSelectWidget = useCloseTokenSelectWidget()

  const importTokenCallback = useAddUserToken()

  const handleImport = useCallback(() => {
    if (tokenToImport) {
      importTokenCallback([tokenToImport])
      onImport(tokenToImport)
      // when we import the token from here, we don't need to import it again in the SelectTokenWidget
      closeTokenSelectWidget({ overrideForceLock: true })
    }
  }, [onImport, importTokenCallback, closeTokenSelectWidget, tokenToImport])

  if (!tokenToImport) {
    return null
  }

  return (
    <Wrapper>
      <ImportTokenModal tokens={[tokenToImport]} onDismiss={onDismiss} onBack={onBack} onImport={handleImport} />
    </Wrapper>
  )
}
