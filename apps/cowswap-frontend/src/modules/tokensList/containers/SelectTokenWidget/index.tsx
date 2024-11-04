import { useCallback, useState } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import {
  ListState,
  TokenListCategory,
  useAddList,
  useAddUserToken,
  useAllListsList,
  useAllActiveTokens,
  useFavoriteTokens,
  useUnsupportedTokens,
  useUserAddedTokens,
} from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import styled from 'styled-components/macro'

import { Field } from 'legacy/state/types'

import { addListAnalytics } from 'modules/analytics'
import { useTokensBalancesCombined } from 'modules/combinedBalances'
import { usePermitCompatibleTokens } from 'modules/permit'
import { useLpTokensWithBalances } from 'modules/yield/shared'

import { getDefaultTokenListCategories } from './getDefaultTokenListCategories'

import { useOnTokenListAddingError } from '../../hooks/useOnTokenListAddingError'
import { useSelectTokenWidgetState } from '../../hooks/useSelectTokenWidgetState'
import { useUpdateSelectTokenWidgetState } from '../../hooks/useUpdateSelectTokenWidgetState'
import { ImportListModal } from '../../pure/ImportListModal'
import { ImportTokenModal } from '../../pure/ImportTokenModal'
import { SelectTokenModal } from '../../pure/SelectTokenModal'
import { LpTokenPage } from '../LpTokenPage'
import { ManageListsAndTokens } from '../ManageListsAndTokens'

const Wrapper = styled.div`
  width: 100%;

  > div {
    height: calc(100vh - 200px);
    min-height: 600px;
  }
`

interface SelectTokenWidgetProps {
  displayLpTokenLists?: boolean
}

export function SelectTokenWidget({ displayLpTokenLists }: SelectTokenWidgetProps) {
  const {
    open,
    onSelectToken,
    tokenToImport,
    listToImport,
    selectedToken,
    onInputPressEnter,
    selectedPoolAddress,
    field,
    oppositeToken,
  } = useSelectTokenWidgetState()
  const { count: lpTokensWithBalancesCount } = useLpTokensWithBalances()

  const [isManageWidgetOpen, setIsManageWidgetOpen] = useState(false)
  const disableErc20 = field === Field.OUTPUT && !!displayLpTokenLists

  const tokenListCategoryState = useState<TokenListCategory[] | null>(
    getDefaultTokenListCategories(field, oppositeToken, lpTokensWithBalancesCount),
  )

  const updateSelectTokenWidget = useUpdateSelectTokenWidgetState()
  const { account } = useWalletInfo()

  const addCustomTokenLists = useAddList((source) => addListAnalytics('Success', source))
  const importTokenCallback = useAddUserToken()

  const allTokens = useAllActiveTokens()
  const favoriteTokens = useFavoriteTokens()
  const userAddedTokens = useUserAddedTokens()
  const allTokenLists = useAllListsList()
  const balancesState = useTokensBalancesCombined()
  const unsupportedTokens = useUnsupportedTokens()
  const permitCompatibleTokens = usePermitCompatibleTokens()
  const onTokenListAddingError = useOnTokenListAddingError()

  const isInjectedWidgetMode = isInjectedWidget()

  const closeTokenSelectWidget = useCallback(() => {
    updateSelectTokenWidget({
      open: false,
      selectedToken: undefined,
      onSelectToken: undefined,
      tokenToImport: undefined,
      listToImport: undefined,
      selectedPoolAddress: undefined,
    })
  }, [updateSelectTokenWidget])

  const openPoolPage = useCallback(
    (selectedPoolAddress: string) => {
      updateSelectTokenWidget({ selectedPoolAddress })
    },
    [updateSelectTokenWidget],
  )

  const closePoolPage = useCallback(() => {
    updateSelectTokenWidget({ selectedPoolAddress: undefined })
  }, [updateSelectTokenWidget])

  const resetTokenImport = useCallback(() => {
    updateSelectTokenWidget({
      tokenToImport: undefined,
    })
  }, [updateSelectTokenWidget])

  const onDismiss = useCallback(() => {
    setIsManageWidgetOpen(false)
    closeTokenSelectWidget()
  }, [closeTokenSelectWidget])

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

        if (selectedPoolAddress) {
          return (
            <LpTokenPage
              poolAddress={selectedPoolAddress}
              onDismiss={onDismiss}
              onBack={closePoolPage}
              onSelectToken={onSelectToken}
            />
          )
        }

        return (
          <SelectTokenModal
            displayLpTokenLists={displayLpTokenLists}
            unsupportedTokens={unsupportedTokens}
            selectedToken={selectedToken}
            allTokens={allTokens}
            favoriteTokens={favoriteTokens}
            balancesState={balancesState}
            permitCompatibleTokens={permitCompatibleTokens}
            onSelectToken={onSelectToken}
            onInputPressEnter={onInputPressEnter}
            onDismiss={onDismiss}
            onOpenManageWidget={() => setIsManageWidgetOpen(true)}
            hideFavoriteTokensTooltip={isInjectedWidgetMode}
            openPoolPage={openPoolPage}
            tokenListCategoryState={tokenListCategoryState}
            disableErc20={disableErc20}
            account={account}
          />
        )
      })()}
    </Wrapper>
  )
}
