import { ReactNode } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'

import { SelectTokenModalContentProps, SelectTokenWidgetContentProps } from './types'

import { ImportListModal } from '../../pure/ImportListModal'
import { ImportTokenModal } from '../../pure/ImportTokenModal'
import { SelectTokenModal } from '../../pure/SelectTokenModal'
import { LpTokenPage } from '../LpTokenPage'
import { ManageListsAndTokens } from '../ManageListsAndTokens'

const EMPTY_FAV_TOKENS: TokenWithLogo[] = []

export function SelectTokenModalContent(props: SelectTokenModalContentProps): ReactNode {
  const {
    standalone,
    displayLpTokenLists,
    unsupportedTokens,
    selectedToken,
    allTokens,
    favoriteTokens,
    recentTokens,
    balancesState,
    permitCompatibleTokens,
    onSelectToken,
    handleTokenListItemClick,
    onInputPressEnter,
    onDismiss,
    setIsManageWidgetOpen,
    isInjectedWidgetMode,
    openPoolPage,
    tokenListCategoryState,
    disableErc20,
    account,
    chainsToSelect,
    onSelectChain,
    areTokensLoading,
    tokenListTags,
    areTokensFromBridge,
    isRouteAvailable,
    clearRecentTokens,
    selectedTargetChainId,
    hasChainPanel,
    chainsPanelTitle,
  } = props

  return (
    <SelectTokenModal
      standalone={standalone}
      displayLpTokenLists={displayLpTokenLists}
      unsupportedTokens={unsupportedTokens}
      selectedToken={selectedToken}
      allTokens={allTokens}
      favoriteTokens={standalone ? EMPTY_FAV_TOKENS : favoriteTokens}
      recentTokens={standalone ? undefined : recentTokens}
      balancesState={balancesState}
      permitCompatibleTokens={permitCompatibleTokens}
      onSelectToken={onSelectToken}
      onTokenListItemClick={handleTokenListItemClick}
      onInputPressEnter={onInputPressEnter}
      onDismiss={onDismiss}
      onOpenManageWidget={() => setIsManageWidgetOpen(true)}
      hideFavoriteTokensTooltip={isInjectedWidgetMode}
      openPoolPage={openPoolPage}
      tokenListCategoryState={tokenListCategoryState}
      disableErc20={disableErc20}
      account={account}
      chainsToSelect={chainsToSelect}
      hasChainPanel={hasChainPanel}
      chainsPanelTitle={chainsPanelTitle}
      onSelectChain={onSelectChain}
      areTokensLoading={areTokensLoading}
      tokenListTags={tokenListTags}
      areTokensFromBridge={areTokensFromBridge}
      isRouteAvailable={isRouteAvailable}
      onClearRecentTokens={clearRecentTokens}
      selectedTargetChainId={selectedTargetChainId}
    />
  )
}

export function SelectTokenWidgetContent(props: SelectTokenWidgetContentProps): ReactNode {
  const { standalone, tokenToImport, listToImport, isManageWidgetOpen, selectedPoolAddress } = props

  if (tokenToImport && !standalone) {
    return (
      <ImportTokenModal
        tokens={[tokenToImport]}
        onDismiss={props.onDismiss}
        onBack={props.resetTokenImport}
        onImport={props.importTokenAndClose}
      />
    )
  }

  if (listToImport && !standalone) {
    return (
      <ImportListModal
        list={listToImport}
        onDismiss={props.onDismiss}
        onBack={props.resetTokenImport}
        onImport={props.importListAndBack}
      />
    )
  }

  if (isManageWidgetOpen && !standalone) {
    return (
      <ManageListsAndTokens
        lists={props.allTokenLists}
        customTokens={props.userAddedTokens}
        onDismiss={props.onDismiss}
        onBack={() => props.setIsManageWidgetOpen(false)}
      />
    )
  }

  if (selectedPoolAddress) {
    return (
      <LpTokenPage
        poolAddress={selectedPoolAddress}
        onDismiss={props.onDismiss}
        onBack={props.closePoolPage}
        onSelectToken={props.onSelectToken}
      />
    )
  }

  return (
    <SelectTokenModalContent
      standalone={props.standalone}
      displayLpTokenLists={props.displayLpTokenLists}
      unsupportedTokens={props.unsupportedTokens}
      selectedToken={props.selectedToken}
      allTokens={props.allTokens}
      favoriteTokens={props.favoriteTokens}
      recentTokens={props.recentTokens}
      balancesState={props.balancesState}
      permitCompatibleTokens={props.permitCompatibleTokens}
      onSelectToken={props.onSelectToken}
      handleTokenListItemClick={props.handleTokenListItemClick}
      onInputPressEnter={props.onInputPressEnter}
      onDismiss={props.onDismiss}
      setIsManageWidgetOpen={props.setIsManageWidgetOpen}
      isInjectedWidgetMode={props.isInjectedWidgetMode}
      openPoolPage={props.openPoolPage}
      tokenListCategoryState={props.tokenListCategoryState}
      disableErc20={props.disableErc20}
      account={props.account}
      chainsToSelect={props.chainsToSelect}
      onSelectChain={props.onSelectChain}
      areTokensLoading={props.areTokensLoading}
      tokenListTags={props.tokenListTags}
      areTokensFromBridge={props.areTokensFromBridge}
      isRouteAvailable={props.isRouteAvailable}
      clearRecentTokens={props.clearRecentTokens}
      selectedTargetChainId={props.selectedTargetChainId}
      hasChainPanel={props.hasChainPanel}
      chainsPanelTitle={props.chainsPanelTitle}
    />
  )
}
