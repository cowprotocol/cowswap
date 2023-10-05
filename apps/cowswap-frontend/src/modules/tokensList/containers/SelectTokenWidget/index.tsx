import { useAtomValue } from 'jotai'
import { useSetAtom } from 'jotai/index'
import { useCallback, useState } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import {
  TokenListInfo,
  useAddCustomTokenLists,
  useAllTokenListsInfo,
  useActiveTokens,
  useFavouriteTokens,
  useImportTokenCallback,
  useUserAddedTokens,
} from '@cowprotocol/tokens'

import styled from 'styled-components/macro'

import { CowModal } from 'common/pure/Modal'

import { ImportListModal } from '../../pure/ImportListModal'
import { ImportTokenModal } from '../../pure/ImportTokenModal'
import { selectTokenWidgetAtom, updateSelectTokenWidgetAtom } from '../../state/selectTokenWidgetAtom'
import { ManageListsAndTokens } from '../ManageListsAndTokens'
import { SelectTokenModal } from '../SelectTokenModal'

const Wrapper = styled.div`
  width: 100%;

  > div {
    height: 100%;
  }
`

// TODO: remove mock
const balancesMock = {}

export function SelectTokenWidget() {
  const { open, onSelectToken, tokenToImport, listToImport } = useAtomValue(selectTokenWidgetAtom)
  const [isManageWidgetOpen, setIsManageWidgetOpen] = useState(false)

  const updateSelectTokenWidget = useSetAtom(updateSelectTokenWidgetAtom)

  const addCustomTokenLists = useAddCustomTokenLists()
  const importTokenCallback = useImportTokenCallback()

  const allTokens = useActiveTokens()
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

  if (!onSelectToken) return null

  return (
    <CowModal isOpen={open} onDismiss={onDismiss}>
      <Wrapper>
        {(() => {
          if (tokenToImport) {
            return (
              <ImportTokenModal
                token={tokenToImport}
                onDismiss={onDismiss}
                onBack={resetTokenImport}
                onImport={importTokenAndClose}
              />
            )
          }

          if (listToImport) {
            return (
              <ImportListModal
                list={listToImport}
                onDismiss={onDismiss}
                onBack={resetTokenImport}
                onImport={importListAndBack}
              />
            )
          }

          if (isManageWidgetOpen) {
            return (
              <ManageListsAndTokens
                lists={allTokenLists}
                customTokens={userAddedTokens}
                onDismiss={onDismiss}
                onBack={() => setIsManageWidgetOpen(false)}
              />
            )
          }

          return (
            <SelectTokenModal
              allTokens={allTokens}
              favouriteTokens={favouriteTokens}
              balances={balancesMock}
              onSelectToken={onSelectToken}
              onDismiss={onDismiss}
              onOpenManageWidget={() => setIsManageWidgetOpen(true)}
            ></SelectTokenModal>
          )
        })()}
      </Wrapper>
    </CowModal>
  )
}
