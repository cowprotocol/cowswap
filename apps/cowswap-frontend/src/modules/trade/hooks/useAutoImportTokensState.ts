import { useEffect, useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { isTruthy } from '@cowprotocol/common-utils'
import { useSearchNonExistentToken } from '@cowprotocol/tokens'

import { Nullish } from 'types'

import { ModalState, useModalState } from 'common/hooks/useModalState'

interface AutoImportTokensState {
  tokensToImport: Array<TokenWithLogo>
  modalState: ModalState<void>
}
export function useAutoImportTokensState(
  inputToken: Nullish<string>,
  outputToken: Nullish<string>
): AutoImportTokensState {
  const modalState = useModalState<void>()
  const foundInputToken = useSearchNonExistentToken(inputToken || null)
  const foundOutputToken = useSearchNonExistentToken(outputToken || null)

  const tokensToImport = useMemo(() => {
    return [foundInputToken, foundOutputToken].filter(isTruthy)
  }, [foundInputToken, foundOutputToken])

  const { openModal, closeModal } = modalState

  const tokensToImportCount = tokensToImport.length

  useEffect(() => {
    if (tokensToImportCount > 0) {
      openModal()
    } else {
      closeModal()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokensToImportCount])

  return { tokensToImport, modalState }
}
