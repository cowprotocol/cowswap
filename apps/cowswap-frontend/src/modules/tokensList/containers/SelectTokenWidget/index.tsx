import { useCallback, useState } from 'react'

import { addListAnalytics } from '@cowprotocol/analytics'
import { useTokensBalances } from '@cowprotocol/balances-and-allowances'
import { TokenWithLogo } from '@cowprotocol/common-const'
import {
  ListState,
  useAddList,
  useAddUserToken,
  useAllListsList,
  useAllTokens,
  useFavouriteTokens,
  useUnsupportedTokens,
  useUserAddedTokens,
} from '@cowprotocol/tokens'

import styled from 'styled-components/macro'

import { usePermitCompatibleTokens } from 'modules/permit'

import { useOnTokenListAddingError } from '../../hooks/useOnTokenListAddingError'
import { useSelectTokenWidgetState } from '../../hooks/useSelectTokenWidgetState'
import { useUpdateSelectTokenWidgetState } from '../../hooks/useUpdateSelectTokenWidgetState'
import { ImportListModal } from '../../pure/ImportListModal'
import { ImportTokenModal } from '../../pure/ImportTokenModal'
import { SelectTokenModal } from '../../pure/SelectTokenModal'
import { ManageListsAndTokens } from '../ManageListsAndTokens'

const Wrapper = styled.div`
  width: 100%;

  > div {
    height: calc(100vh - 200px);
    min-height: 600px;
  }
`

export function SelectTokenWidget() {
  const { open, onSelectToken, tokenToImport, listToImport, selectedToken, onInputPressEnter } =
    useSelectTokenWidgetState()
  const [isManageWidgetOpen, setIsManageWidgetOpen] = useState(false)

  const updateSelectTokenWidget = useUpdateSelectTokenWidgetState()

  const addCustomTokenLists = useAddList()
  const importTokenCallback = useAddUserToken()

  const allTokens = useAllTokens()
  const favouriteTokens = useFavouriteTokens()
  const userAddedTokens = useUserAddedTokens()
  const allTokenLists = useAllListsList()
  const balancesState = useTokensBalances()
  const unsupportedTokens = useUnsupportedTokens()
  const permitCompatibleTokens = usePermitCompatibleTokens()
  const onTokenListAddingError = useOnTokenListAddingError()

  const closeTokenSelectWidget = useCallback(() => {
    updateSelectTokenWidget({
      open: false,
      selectedToken: undefined,
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

  const importTokenAndClose = (tokens: TokenWithLogo[]) => {
    importTokenCallback(tokens)
    onSelectToken?.(tokens[0])
    onDismiss()
  }

  const importListAndBack = (list: ListState) => {
    try {
      addCustomTokenLists(list)
      addListAnalytics('Success', list.source)
    } catch (error) {
      onDismiss()
      onTokenListAddingError(error)
    }
    updateSelectTokenWidget({ listToImport: undefined })
  }

  if (!onSelectToken || !open) return null

  return (
    <Wrapper>
      {(() => {
        if (tokenToImport) {
          return (
            <ImportTokenModal
              tokens={[tokenToImport]}
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
            unsupportedTokens={unsupportedTokens}
            selectedToken={selectedToken}
            allTokens={allTokens}
            favouriteTokens={favouriteTokens}
            balancesState={balancesState}
            permitCompatibleTokens={permitCompatibleTokens}
            onSelectToken={onSelectToken}
            onInputPressEnter={onInputPressEnter}
            onDismiss={onDismiss}
            onOpenManageWidget={() => setIsManageWidgetOpen(true)}
          ></SelectTokenModal>
        )
      })()}
    </Wrapper>
  )
}
