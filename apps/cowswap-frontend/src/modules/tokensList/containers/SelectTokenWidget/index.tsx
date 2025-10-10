import { ReactNode, useCallback, useState } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { LpToken, TokenWithLogo } from '@cowprotocol/common-const'
import { useTheme } from '@cowprotocol/common-hooks'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import {
  ListState,
  TokenListCategory,
  useAddList,
  useAddUserToken,
  useAllListsList,
  useTokenListsTags,
  useUnsupportedTokens,
  useUserAddedTokens,
} from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Currency } from '@uniswap/sdk-core'

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

const EMPTY_FAV_TOKENS: TokenWithLogo[] = []

interface SelectTokenWidgetProps {
  displayLpTokenLists?: boolean
  standalone?: boolean
}

interface SelectTokenWidgetViewModel {
  shouldRender: boolean
  modalContent: ReactNode | null
}

function getChainIdFromToken(token: TokenWithLogo | LpToken | Currency | undefined): number | undefined {
  return token ? token.chainId : undefined
}

// TODO: Refactor this view model into smaller helpers to satisfy lint rules.
// eslint-disable-next-line max-lines-per-function
function useSelectTokenWidgetViewModel({
  displayLpTokenLists,
  standalone,
}: SelectTokenWidgetProps): SelectTokenWidgetViewModel {
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
    tradeType,
    selectedTargetChainId,
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
  const { account, chainId } = useWalletInfo()
  const theme = useTheme()

  const cowAnalytics = useCowAnalytics()
  const addCustomTokenLists = useAddList((source) => {
    cowAnalytics.sendEvent({
      category: CowSwapAnalyticsCategory.LIST,
      action: 'Add List Success',
      label: source,
    })
  })
  const importTokenCallback = useAddUserToken()

  const {
    tokens: allTokens,
    isLoading: areTokensLoading,
    favoriteTokens,
    areTokensFromBridge,
    isRouteAvailable,
  } = useTokensToSelect()

  const counterChainId =
    getChainIdFromToken(oppositeToken) ?? (field === Field.INPUT ? (selectedTargetChainId ?? chainId) : chainId)

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

  const importTokenAndClose = (tokens: TokenWithLogo[]): void => {
    importTokenCallback(tokens)
    onSelectToken?.(tokens[0])
    onDismiss()
  }

  const importListAndBack = (list: ListState): void => {
    try {
      addCustomTokenLists(list)
    } catch (error) {
      onDismiss()
      onTokenListAddingError(error)
    }
    updateSelectTokenWidget({ listToImport: undefined })
  }

  if (!onSelectToken || !open) {
    return { shouldRender: false, modalContent: null }
  }

  let modalContent: ReactNode

  if (tokenToImport && !standalone) {
    modalContent = (
      <ImportTokenModal
        tokens={[tokenToImport]}
        onDismiss={onDismiss}
        onBack={resetTokenImport}
        onImport={importTokenAndClose}
      />
    )
  } else if (listToImport && !standalone) {
    modalContent = (
      <ImportListModal
        list={listToImport}
        onDismiss={onDismiss}
        onBack={resetTokenImport}
        onImport={importListAndBack}
      />
    )
  } else if (isManageWidgetOpen && !standalone) {
    modalContent = (
      <ManageListsAndTokens
        lists={allTokenLists}
        customTokens={userAddedTokens}
        onDismiss={onDismiss}
        onBack={() => setIsManageWidgetOpen(false)}
      />
    )
  } else if (selectedPoolAddress) {
    modalContent = (
      <LpTokenPage
        poolAddress={selectedPoolAddress}
        onDismiss={onDismiss}
        onBack={closePoolPage}
        onSelectToken={onSelectToken}
      />
    )
  } else {
    modalContent = (
      <SelectTokenModal
        standalone={standalone}
        displayLpTokenLists={displayLpTokenLists}
        unsupportedTokens={unsupportedTokens}
        selectedToken={selectedToken}
        allTokens={allTokens}
        favoriteTokens={standalone ? EMPTY_FAV_TOKENS : favoriteTokens}
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
        areTokensFromBridge={areTokensFromBridge}
        isRouteAvailable={isRouteAvailable}
        tradeType={tradeType}
        field={field}
        isDarkMode={theme.darkMode}
        counterChainId={counterChainId}
      />
    )
  }

  return { shouldRender: true, modalContent }
}

export function SelectTokenWidget(props: SelectTokenWidgetProps): ReactNode {
  const { shouldRender, modalContent } = useSelectTokenWidgetViewModel(props)

  if (!shouldRender || !modalContent) {
    return null
  }

  return <Wrapper>{modalContent}</Wrapper>
}
