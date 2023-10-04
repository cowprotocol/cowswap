import { useAtomValue } from 'jotai'
import { useSetAtom } from 'jotai/index'
import { useCallback, useState } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import {
  TokenListInfo,
  useAddCustomTokenLists,
  useAllTokenListsInfo,
  useAllTokens,
  useFavouriteTokens,
  useImportTokenCallback,
  useUserAddedTokens,
} from '@cowprotocol/tokens'

import { CowModal } from 'common/pure/Modal'

import { ImportListModal } from '../../pure/ImportListModal'
import { ImportTokenModal } from '../../pure/ImportTokenModal'
import { selectTokenWidgetAtom, updateSelectTokenWidgetAtom } from '../../state/selectTokenWidgetAtom'
import { ManageListsAndTokens } from '../ManageListsAndTokens'
import { SelectTokenModal } from '../SelectTokenModal'

// TODO: remove mock
const balancesMock = {}

export function SelectTokenWidget() {
  const { open, onSelectToken, tokenToImport, listToImport } = useAtomValue(selectTokenWidgetAtom)
  const [isManageWidgetOpen, setIsManageWidgetOpen] = useState(false)

  const updateSelectTokenWidget = useSetAtom(updateSelectTokenWidgetAtom)

  const addCustomTokenLists = useAddCustomTokenLists()
  const importTokenCallback = useImportTokenCallback()

  const allTokens = useAllTokens()
  const favouriteTokens = useFavouriteTokens()
  const userAddedTokens = useUserAddedTokens()
  const allTokenLists = useAllTokenListsInfo()

  const closeTokenSelectWidget = useCallback(() => {
    updateSelectTokenWidget({
      open: false,
      onSelectToken: undefined,
      tokenToImport: undefined,
      listToImport: undefined,
    })
  }, [updateSelectTokenWidget])

  const resetTokenImport = () => {
    updateSelectTokenWidget({
      tokenToImport: undefined,
    })
  }

  const onDismiss = () => {
    setIsManageWidgetOpen(false)
    closeTokenSelectWidget()
  }

  const importTokenAndClose = (token: TokenWithLogo) => {
    importTokenCallback(token)
    onDismiss()
  }

  const importListAndBack = (list: TokenListInfo) => {
    addCustomTokenLists(list)
    updateSelectTokenWidget({ listToImport: undefined })
  }

  if (tokenToImport) {
    return (
      <CowModal isOpen={true} onDismiss={onDismiss}>
        <ImportTokenModal
          token={tokenToImport}
          onDismiss={onDismiss}
          onBack={resetTokenImport}
          onImport={importTokenAndClose}
        />
      </CowModal>
    )
  }

  if (listToImport) {
    return (
      <CowModal isOpen={true} onDismiss={onDismiss}>
        <ImportListModal
          list={listToImport}
          onDismiss={onDismiss}
          onBack={resetTokenImport}
          onImport={importListAndBack}
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
          onDismiss={onDismiss}
          onOpenManageWidget={() => setIsManageWidgetOpen(true)}
        ></SelectTokenModal>
      )}
    </CowModal>
  )
}
