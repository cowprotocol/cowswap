import { useAtomValue } from 'jotai'
import { useState } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import {
  useAllTokenListsInfo,
  useAllTokens,
  useFavouriteTokens,
  useImportTokenCallback,
  useUserAddedTokens,
} from '@cowprotocol/tokens'

import { CowModal } from 'common/pure/Modal'

import { useCloseTokenSelectWidget } from '../../hooks/useCloseTokenSelectWidget'
import { useResetTokenImport } from '../../hooks/useResetTokenImport'
import { useToggleTokenSelectWidget } from '../../hooks/useToggleTokenSelectWidget'
import { ImportTokenModal } from '../../pure/ImportTokenModal'
import { selectTokenWidgetAtom } from '../../state/selectTokenWidgetAtom'
import { ManageListsAndTokens } from '../ManageListsAndTokens'
import { SelectTokenModal } from '../SelectTokenModal'

// TODO: remove mock
const balancesMock = {}

export function SelectTokenWidget() {
  const { open, onSelectToken, tokenToImport } = useAtomValue(selectTokenWidgetAtom)
  const [isManageWidgetOpen, setIsManageWidgetOpen] = useState(false)

  const closeTokenSelectWidget = useCloseTokenSelectWidget()
  const toggleTokenSelectWidget = useToggleTokenSelectWidget()
  const resetTokenImport = useResetTokenImport()
  const importTokenCallback = useImportTokenCallback()

  const allTokens = useAllTokens()
  const favouriteTokens = useFavouriteTokens()
  const userAddedTokens = useUserAddedTokens()
  const allTokenLists = useAllTokenListsInfo()

  const onDismiss = () => {
    setIsManageWidgetOpen(false)
    closeTokenSelectWidget()
  }

  const importAndClose = (token: TokenWithLogo) => {
    importTokenCallback(token)
    onDismiss()
  }

  if (tokenToImport) {
    return (
      <CowModal isOpen={true} onDismiss={onDismiss}>
        <ImportTokenModal
          token={tokenToImport}
          onDismiss={onDismiss}
          onBack={resetTokenImport}
          onImport={importAndClose}
        />
      </CowModal>
    )
  }

  if (!onSelectToken) return null

  return (
    <CowModal isOpen={open} onDismiss={onDismiss}>
      {isManageWidgetOpen ? (
        <ManageListsAndTokens
          lists={allTokenLists}
          customTokens={userAddedTokens}
          onDismiss={onDismiss}
          onBack={() => setIsManageWidgetOpen(false)}
        />
      ) : (
        <SelectTokenModal
          allTokens={allTokens}
          favouriteTokens={favouriteTokens}
          balances={balancesMock}
          onSelectToken={onSelectToken}
          onDismiss={toggleTokenSelectWidget}
          onOpenManageWidget={() => setIsManageWidgetOpen(true)}
        ></SelectTokenModal>
      )}
    </CowModal>
  )
}
