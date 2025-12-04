import { ReactNode } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'

import {
  GetSelectTokenWidgetContentProps,
  RenderImportListModalProps,
  RenderImportTokenModalProps,
  RenderLpTokenPageProps,
  RenderManageListsAndTokensProps,
  RenderSelectTokenModalProps,
} from './types'

import { ImportListModal } from '../../pure/ImportListModal'
import { ImportTokenModal } from '../../pure/ImportTokenModal'
import { SelectTokenModal } from '../../pure/SelectTokenModal'
import { LpTokenPage } from '../LpTokenPage'
import { ManageListsAndTokens } from '../ManageListsAndTokens'

const EMPTY_FAV_TOKENS: TokenWithLogo[] = []

function renderImportTokenModal({
  tokenToImport,
  onDismiss,
  resetTokenImport,
  importTokenAndClose,
}: RenderImportTokenModalProps): ReactNode {
  return (
    <ImportTokenModal
      tokens={[tokenToImport]}
      onDismiss={onDismiss}
      onBack={resetTokenImport}
      onImport={importTokenAndClose}
    />
  )
}

function renderImportListModal({
  listToImport,
  onDismiss,
  resetTokenImport,
  importListAndBack,
}: RenderImportListModalProps): ReactNode {
  return (
    <ImportListModal list={listToImport} onDismiss={onDismiss} onBack={resetTokenImport} onImport={importListAndBack} />
  )
}

function renderManageListsAndTokens({
  allTokenLists,
  userAddedTokens,
  onDismiss,
  setIsManageWidgetOpen,
}: RenderManageListsAndTokensProps): ReactNode {
  return (
    <ManageListsAndTokens
      lists={allTokenLists}
      customTokens={userAddedTokens}
      onDismiss={onDismiss}
      onBack={() => setIsManageWidgetOpen(false)}
    />
  )
}

function renderLpTokenPage({
  selectedPoolAddress,
  onDismiss,
  closePoolPage,
  onSelectToken,
}: RenderLpTokenPageProps): ReactNode {
  return (
    <LpTokenPage
      poolAddress={selectedPoolAddress}
      onDismiss={onDismiss}
      onBack={closePoolPage}
      onSelectToken={onSelectToken}
    />
  )
}

function renderSelectTokenModal(props: RenderSelectTokenModalProps): ReactNode {
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

export function getSelectTokenWidgetContent(props: GetSelectTokenWidgetContentProps): ReactNode {
  const { standalone, tokenToImport, listToImport, isManageWidgetOpen, selectedPoolAddress } = props

  if (tokenToImport && !standalone) {
    return renderImportTokenModal({
      tokenToImport,
      onDismiss: props.onDismiss,
      resetTokenImport: props.resetTokenImport,
      importTokenAndClose: props.importTokenAndClose,
    })
  }

  if (listToImport && !standalone) {
    return renderImportListModal({
      listToImport,
      onDismiss: props.onDismiss,
      resetTokenImport: props.resetTokenImport,
      importListAndBack: props.importListAndBack,
    })
  }

  if (isManageWidgetOpen && !standalone) {
    return renderManageListsAndTokens({
      allTokenLists: props.allTokenLists,
      userAddedTokens: props.userAddedTokens,
      onDismiss: props.onDismiss,
      setIsManageWidgetOpen: props.setIsManageWidgetOpen,
    })
  }

  if (selectedPoolAddress) {
    return renderLpTokenPage({
      selectedPoolAddress,
      onDismiss: props.onDismiss,
      closePoolPage: props.closePoolPage,
      onSelectToken: props.onSelectToken,
    })
  }

  return renderSelectTokenModal({
    standalone: props.standalone,
    displayLpTokenLists: props.displayLpTokenLists,
    unsupportedTokens: props.unsupportedTokens,
    selectedToken: props.selectedToken,
    allTokens: props.allTokens,
    favoriteTokens: props.favoriteTokens,
    recentTokens: props.recentTokens,
    balancesState: props.balancesState,
    permitCompatibleTokens: props.permitCompatibleTokens,
    onSelectToken: props.onSelectToken,
    handleTokenListItemClick: props.handleTokenListItemClick,
    onInputPressEnter: props.onInputPressEnter,
    onDismiss: props.onDismiss,
    setIsManageWidgetOpen: props.setIsManageWidgetOpen,
    isInjectedWidgetMode: props.isInjectedWidgetMode,
    openPoolPage: props.openPoolPage,
    tokenListCategoryState: props.tokenListCategoryState,
    disableErc20: props.disableErc20,
    account: props.account,
    chainsToSelect: props.chainsToSelect,
    onSelectChain: props.onSelectChain,
    areTokensLoading: props.areTokensLoading,
    tokenListTags: props.tokenListTags,
    areTokensFromBridge: props.areTokensFromBridge,
    isRouteAvailable: props.isRouteAvailable,
    clearRecentTokens: props.clearRecentTokens,
    selectedTargetChainId: props.selectedTargetChainId,
  })
}
