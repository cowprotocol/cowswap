import { ReactNode } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'

import { SelectTokenWidgetContentProps } from './types'

import { ImportListModal } from '../../pure/ImportListModal'
import { ImportTokenModal } from '../../pure/ImportTokenModal'
import { SelectTokenModal } from '../../pure/SelectTokenModal'
import { LpTokenPage } from '../LpTokenPage'
import { ManageListsAndTokens } from '../ManageListsAndTokens'

const EMPTY_FAV_TOKENS: TokenWithLogo[] = []

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
    <SelectTokenModal
      standalone={props.standalone}
      displayLpTokenLists={props.displayLpTokenLists}
      unsupportedTokens={props.unsupportedTokens}
      selectedToken={props.selectedToken}
      allTokens={props.allTokens}
      favoriteTokens={props.standalone ? EMPTY_FAV_TOKENS : props.favoriteTokens}
      recentTokens={props.standalone ? undefined : props.recentTokens}
      balancesState={props.balancesState}
      permitCompatibleTokens={props.permitCompatibleTokens}
      onSelectToken={props.onSelectToken}
      onTokenListItemClick={props.handleTokenListItemClick}
      onInputPressEnter={props.onInputPressEnter}
      onDismiss={props.onDismiss}
      onOpenManageWidget={() => props.setIsManageWidgetOpen(true)}
      hideFavoriteTokensTooltip={props.isInjectedWidgetMode}
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
      onClearRecentTokens={props.clearRecentTokens}
      selectedTargetChainId={props.selectedTargetChainId}
    />
  )
}
