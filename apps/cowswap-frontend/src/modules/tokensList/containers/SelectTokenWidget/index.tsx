import { useCallback, useState } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import {
  ListState,
  TokenListCategory,
  useAddList,
  useAddUserToken,
  useAllListsList,
  useFavoriteTokens,
  useTokenListsTags,
  useUnsupportedTokens,
  useUserAddedTokens,
} from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import styled from 'styled-components/macro'

import { Field } from 'legacy/state/types'

import { useTokensBalancesCombined } from 'modules/combinedBalances'
import { usePermitCompatibleTokens } from 'modules/permit'
import { useLpTokensWithBalances } from 'modules/yield/shared'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'

import { getDefaultTokenListCategories } from './getDefaultTokenListCategories'

import { useChainsToSelect } from '../../hooks/useChainsToSelect'
import { useCloseTokenSelectWidget } from '../../hooks/useCloseTokenSelectWidget'
import { useOnSelectChain } from '../../hooks/useOnSelectChain'
import { useOnTokenListAddingError } from '../../hooks/useOnTokenListAddingError'
import { useSelectTokenWidgetState } from '../../hooks/useSelectTokenWidgetState'
import { useTokensToSelect } from '../../hooks/useTokensToSelect'
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

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
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
  const chainsToSelect = useChainsToSelect()
  const onSelectChain = useOnSelectChain()

  const [isManageWidgetOpen, setIsManageWidgetOpen] = useState(false)
  const disableErc20 = field === Field.OUTPUT && !!displayLpTokenLists

  const tokenListCategoryState = useState<TokenListCategory[] | null>(
    getDefaultTokenListCategories(field, oppositeToken, lpTokensWithBalancesCount),
  )

  const updateSelectTokenWidget = useUpdateSelectTokenWidgetState()
  const { account } = useWalletInfo()

  const cowAnalytics = useCowAnalytics()
  const addCustomTokenLists = useAddList((source) => {
    cowAnalytics.sendEvent({
      category: CowSwapAnalyticsCategory.LIST,
      action: 'Add List Success',
      label: source,
    })
  })
  const importTokenCallback = useAddUserToken()

  const { tokens: allTokens, isLoading: areTokensLoading } = useTokensToSelect()
  const favoriteTokens = useFavoriteTokens()
  const userAddedTokens = useUserAddedTokens()
  const allTokenLists = useAllListsList()
  const balancesState = useTokensBalancesCombined()
  const unsupportedTokens = useUnsupportedTokens()
  const permitCompatibleTokens = usePermitCompatibleTokens()
  const tokenListTags = useTokenListsTags()
  const onTokenListAddingError = useOnTokenListAddingError()

  const isInjectedWidgetMode = isInjectedWidget()

  const closeTokenSelectWidget = useCloseTokenSelectWidget()

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

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const importTokenAndClose = (tokens: TokenWithLogo[]) => {
    importTokenCallback(tokens)
    onSelectToken?.(tokens[0])
    onDismiss()
  }

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const importListAndBack = (list: ListState) => {
    try {
      addCustomTokenLists(list)
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
            chainsToSelect={chainsToSelect}
            onSelectChain={onSelectChain}
            areTokensLoading={areTokensLoading}
            tokenListTags={tokenListTags}
          />
        )
      })()}
    </Wrapper>
  )
}
