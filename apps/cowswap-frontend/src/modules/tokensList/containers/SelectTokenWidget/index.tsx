import { ReactNode, useCallback, useState } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { TokenWithLogo } from '@cowprotocol/common-const'
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

import styled from 'styled-components/macro'

import { Field } from 'legacy/state/types'

import { useTokensBalancesCombined } from 'modules/combinedBalances'
import { usePermitCompatibleTokens } from 'modules/permit'
import { useLpTokensWithBalances } from 'modules/yield/shared'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'

import { getDefaultTokenListCategories } from './getDefaultTokenListCategories'
import { SelectTokenWidgetContent } from './helpers'

import { useChainsToSelect } from '../../hooks/useChainsToSelect'
import { useCloseTokenSelectWidget } from '../../hooks/useCloseTokenSelectWidget'
import { useOnSelectChain } from '../../hooks/useOnSelectChain'
import { useOnTokenListAddingError } from '../../hooks/useOnTokenListAddingError'
import { useRecentTokens } from '../../hooks/useRecentTokens'
import { useSelectTokenWidgetState } from '../../hooks/useSelectTokenWidgetState'
import { useTokensToSelect } from '../../hooks/useTokensToSelect'
import { useUpdateSelectTokenWidgetState } from '../../hooks/useUpdateSelectTokenWidgetState'

const Wrapper = styled.div`
  width: 100%;

  > div {
    height: calc(100vh - 200px);
    min-height: 600px;
  }
`

interface SelectTokenWidgetProps {
  displayLpTokenLists?: boolean
  standalone?: boolean
}

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
export function SelectTokenWidget({ displayLpTokenLists, standalone }: SelectTokenWidgetProps): ReactNode {
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
  const { account, chainId: walletChainId } = useWalletInfo()

  const cowAnalytics = useCowAnalytics()
  const trackAddListAnalytics = useCallback(
    (source: string) => {
      cowAnalytics.sendEvent({
        category: CowSwapAnalyticsCategory.LIST,
        action: 'Add List Success',
        label: source,
      })
    },
    [cowAnalytics],
  )
  const addCustomTokenLists = useAddList(trackAddListAnalytics)
  const importTokenCallback = useAddUserToken()

  const {
    tokens: allTokens,
    isLoading: areTokensLoading,
    favoriteTokens,
    areTokensFromBridge,
    isRouteAvailable,
  } = useTokensToSelect()
  const { recentTokens, addRecentToken, clearRecentTokens } = useRecentTokens({
    allTokens,
    favoriteTokens,
    activeChainId: selectedTargetChainId ?? walletChainId,
  })
  const handleTokenListItemClick = useCallback(
    (token: TokenWithLogo) => {
      addRecentToken(token)
    },
    [addRecentToken],
  )

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
    closeTokenSelectWidget({ overrideForceLock: true })
  }, [closeTokenSelectWidget])

  const importTokenAndClose = useCallback(
    (tokens: TokenWithLogo[]): void => {
      importTokenCallback(tokens)
      const [tokenToSelect] = tokens

      if (tokenToSelect) {
        handleTokenListItemClick(tokenToSelect)
        onSelectToken?.(tokenToSelect)
      }

      onDismiss()
    },
    [handleTokenListItemClick, importTokenCallback, onDismiss, onSelectToken],
  )

  const importListAndBack = (list: ListState): void => {
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
      <SelectTokenWidgetContent
        standalone={standalone}
        tokenToImport={tokenToImport}
        listToImport={listToImport}
        isManageWidgetOpen={isManageWidgetOpen}
        selectedPoolAddress={selectedPoolAddress}
        displayLpTokenLists={displayLpTokenLists}
        unsupportedTokens={unsupportedTokens}
        selectedToken={selectedToken}
        allTokens={allTokens}
        favoriteTokens={favoriteTokens}
        recentTokens={recentTokens}
        balancesState={balancesState}
        permitCompatibleTokens={permitCompatibleTokens}
        onSelectToken={onSelectToken}
        handleTokenListItemClick={handleTokenListItemClick}
        onInputPressEnter={onInputPressEnter}
        onDismiss={onDismiss}
        setIsManageWidgetOpen={setIsManageWidgetOpen}
        resetTokenImport={resetTokenImport}
        importTokenAndClose={importTokenAndClose}
        closePoolPage={closePoolPage}
        importListAndBack={importListAndBack}
        isInjectedWidgetMode={isInjectedWidgetMode}
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
        clearRecentTokens={clearRecentTokens}
        selectedTargetChainId={selectedTargetChainId}
        allTokenLists={allTokenLists}
        userAddedTokens={userAddedTokens}
      />
    </Wrapper>
  )
}
