import { useEffect, useMemo, useState } from 'react'

import { isTruthy } from '@cowprotocol/common-utils'
import { useAddUserToken, useSearchNonExistentToken } from '@cowprotocol/tokens'

import { Nullish } from 'types'

import { CowModal } from 'common/pure/Modal'

import { ImportTokenModal } from '../../pure/ImportTokenModal'

export interface AutoImportTokensProps {
  inputToken: Nullish<string>
  outputToken: Nullish<string>
}

export function AutoImportTokens({ inputToken, outputToken }: AutoImportTokensProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const importTokenCallback = useAddUserToken()
  const foundInputToken = useSearchNonExistentToken(inputToken || null)
  const foundOutputToken = useSearchNonExistentToken(outputToken || null)

  const tokensToImport = useMemo(() => {
    return [foundInputToken, foundOutputToken].filter(isTruthy)
  }, [foundInputToken, foundOutputToken])

  const tokensToImportCount = tokensToImport.length

  const onDismiss = () => setIsModalOpen(false)

  useEffect(() => {
    if (tokensToImportCount > 0) {
      setIsModalOpen(true)
    }
  }, [tokensToImportCount])

  if (tokensToImportCount === 0) return null

  return (
    <CowModal isOpen={isModalOpen} onDismiss={onDismiss}>
      <ImportTokenModal tokens={tokensToImport} onDismiss={onDismiss} onImport={importTokenCallback} />
    </CowModal>
  )
}
