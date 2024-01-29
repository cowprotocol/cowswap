import { useEffect, useMemo } from 'react'

import { isTruthy } from '@cowprotocol/common-utils'
import { useAddUserToken, useSearchNonExistentToken } from '@cowprotocol/tokens'

import { Nullish } from 'types'

import { ModalState } from 'common/hooks/useModalState'

import { ImportTokenModal } from '../../pure/ImportTokenModal'

export interface AutoImportTokensProps {
  modalState: ModalState<void>
  inputToken: Nullish<string>
  outputToken: Nullish<string>
}

export function AutoImportTokens({ modalState, inputToken, outputToken }: AutoImportTokensProps) {
  const { isModalOpen, openModal, closeModal } = modalState

  const importTokenCallback = useAddUserToken()
  const foundInputToken = useSearchNonExistentToken(inputToken || null)
  const foundOutputToken = useSearchNonExistentToken(outputToken || null)

  const tokensToImport = useMemo(() => {
    return [foundInputToken, foundOutputToken].filter(isTruthy)
  }, [foundInputToken, foundOutputToken])

  const tokensToImportCount = tokensToImport.length

  useEffect(() => {
    if (tokensToImportCount > 0) {
      openModal()
    } else {
      closeModal()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokensToImportCount])

  return (
    <>
      {isModalOpen && (
        <ImportTokenModal tokens={tokensToImport} onDismiss={closeModal} onImport={importTokenCallback} />
      )}
    </>
  )
}
