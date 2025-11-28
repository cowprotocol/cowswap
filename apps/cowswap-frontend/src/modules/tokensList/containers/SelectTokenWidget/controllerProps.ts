import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { ChainInfo } from '@cowprotocol/cow-sdk'
import { ListState } from '@cowprotocol/tokens'

import { ChainsToSelectState, TokenSelectionHandler } from '../../types'

import type { TokenDataSources, TokenListCategoryState } from './controllerState'
import type { useSelectTokenWidgetState } from '../../hooks/useSelectTokenWidgetState'
import type { SelectTokenModalProps } from '../../pure/SelectTokenModal'

type WidgetState = ReturnType<typeof useSelectTokenWidgetState>
export interface SelectTokenWidgetViewProps {
  standalone?: boolean
  tokenToImport?: TokenWithLogo
  listToImport?: ListState
  isManageWidgetOpen: boolean
  selectedPoolAddress?: string
  isChainPanelEnabled: boolean
  chainsPanelTitle: string
  chainsToSelect: ChainsToSelectState | undefined
  onSelectChain(chain: ChainInfo): void
  onDismiss(): void
  onBackFromImport(): void
  onImportTokens(tokens: TokenWithLogo[]): void
  onImportList(list: ListState): void
  allTokenLists: ListState[]
  userAddedTokens: TokenWithLogo[]
  onCloseManageWidget(): void
  onClosePoolPage(): void
  selectTokenModalProps: SelectTokenModalProps
  onSelectToken: TokenSelectionHandler
}

interface BuildViewPropsArgs {
  standalone?: boolean
  tokenToImport?: TokenWithLogo
  listToImport?: ListState
  isManageWidgetOpen: boolean
  selectedPoolAddress?: string
  isChainPanelEnabled: boolean
  chainsPanelTitle: string
  chainsToSelect: ChainsToSelectState | undefined
  onSelectChain(chain: ChainInfo): void
  onDismiss(): void
  onBackFromImport(): void
  onImportTokens(tokens: TokenWithLogo[]): void
  onImportList(list: ListState): void
  allTokenLists: ListState[]
  userAddedTokens: TokenWithLogo[]
  onCloseManageWidget(): void
  onClosePoolPage(): void
  selectTokenModalProps: SelectTokenModalProps
  onSelectToken: TokenSelectionHandler
}

interface BuildModalPropsArgs {
  standalone?: boolean
  displayLpTokenLists?: boolean
  tokenData: TokenDataSources
  widgetState: WidgetState
  favoriteTokens: TokenWithLogo[]
  recentTokens: TokenWithLogo[]
  handleSelectToken: TokenSelectionHandler
  onTokenListItemClick(token: TokenWithLogo): void
  onClearRecentTokens(): void
  onDismiss(): void
  onOpenManageWidget(): void
  openPoolPage(poolAddress: string): void
  tokenListCategoryState: TokenListCategoryState
  disableErc20: boolean
  account: string | undefined
  hasChainPanel: boolean
  chainsState?: ChainsToSelectState
  onSelectChain?(chain: ChainInfo): void
  isInjectedWidgetMode: boolean
  chainsPanelTitle: string
  modalTitle: string
}

export function buildSelectTokenWidgetViewProps({
  standalone,
  tokenToImport,
  listToImport,
  isManageWidgetOpen,
  selectedPoolAddress,
  isChainPanelEnabled,
  chainsPanelTitle,
  chainsToSelect,
  onSelectChain,
  onDismiss,
  onBackFromImport,
  onImportTokens,
  onImportList,
  allTokenLists,
  userAddedTokens,
  onCloseManageWidget,
  onClosePoolPage,
  selectTokenModalProps,
  onSelectToken,
}: BuildViewPropsArgs): SelectTokenWidgetViewProps {
  return {
    standalone,
    tokenToImport,
    listToImport,
    isManageWidgetOpen,
    selectedPoolAddress,
    isChainPanelEnabled,
    chainsPanelTitle,
    chainsToSelect,
    onSelectChain,
    onDismiss,
    onBackFromImport,
    onImportTokens,
    onImportList,
    allTokenLists,
    userAddedTokens,
    onCloseManageWidget,
    onClosePoolPage,
    selectTokenModalProps,
    onSelectToken,
  }
}

export function buildSelectTokenModalPropsInput({
  standalone,
  displayLpTokenLists,
  tokenData,
  widgetState,
  favoriteTokens,
  recentTokens,
  handleSelectToken,
  onTokenListItemClick,
  onClearRecentTokens,
  onDismiss,
  onOpenManageWidget,
  openPoolPage,
    tokenListCategoryState,
    disableErc20,
    account,
  hasChainPanel,
  chainsState,
  onSelectChain,
  isInjectedWidgetMode,
  chainsPanelTitle,
  modalTitle,
}: BuildModalPropsArgs): SelectTokenModalProps {
  const selectChainHandler: (chain: ChainInfo) => void = onSelectChain ?? (() => undefined)

  return {
    standalone,
    displayLpTokenLists,
    unsupportedTokens: tokenData.unsupportedTokens,
    selectedToken: widgetState.selectedToken,
    allTokens: tokenData.allTokens,
    favoriteTokens,
    recentTokens,
    balancesState: tokenData.balancesState,
    permitCompatibleTokens: tokenData.permitCompatibleTokens,
    onSelectToken: handleSelectToken,
    onTokenListItemClick,
    onInputPressEnter: widgetState.onInputPressEnter,
    onDismiss,
    onOpenManageWidget,
    openPoolPage,
    tokenListCategoryState,
    disableErc20,
    account,
    areTokensLoading: tokenData.areTokensLoading,
    tokenListTags: tokenData.tokenListTags,
    areTokensFromBridge: tokenData.areTokensFromBridge,
    isRouteAvailable: tokenData.isRouteAvailable,
    modalTitle,
    hasChainPanel,
    chainsToSelect: chainsState,
    chainsPanelTitle,
    hideFavoriteTokensTooltip: isInjectedWidgetMode,
    selectedTargetChainId: widgetState.selectedTargetChainId,
    onSelectChain: selectChainHandler,
    onClearRecentTokens,
  }
}

export function useSelectTokenModalPropsMemo(props: SelectTokenModalProps): SelectTokenModalProps {
  return useMemo(
    () => ({
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
      onTokenListItemClick: props.onTokenListItemClick,
      onInputPressEnter: props.onInputPressEnter,
      onDismiss: props.onDismiss,
      onOpenManageWidget: props.onOpenManageWidget,
      openPoolPage: props.openPoolPage,
      tokenListCategoryState: props.tokenListCategoryState,
      disableErc20: props.disableErc20,
      account: props.account,
      areTokensLoading: props.areTokensLoading,
      tokenListTags: props.tokenListTags,
      areTokensFromBridge: props.areTokensFromBridge,
      isRouteAvailable: props.isRouteAvailable,
      modalTitle: props.modalTitle,
      hasChainPanel: props.hasChainPanel,
      hideFavoriteTokensTooltip: props.hideFavoriteTokensTooltip,
      chainsPanelTitle: props.chainsPanelTitle,
      selectedTargetChainId: props.selectedTargetChainId,
      onSelectChain: props.onSelectChain,
      onClearRecentTokens: props.onClearRecentTokens,
    }),
    [
      props.standalone,
      props.displayLpTokenLists,
      props.unsupportedTokens,
      props.selectedToken,
      props.allTokens,
      props.favoriteTokens,
      props.recentTokens,
      props.balancesState,
      props.permitCompatibleTokens,
      props.onSelectToken,
      props.onTokenListItemClick,
      props.onInputPressEnter,
      props.onDismiss,
      props.onOpenManageWidget,
      props.openPoolPage,
      props.tokenListCategoryState,
      props.disableErc20,
      props.account,
      props.areTokensLoading,
      props.tokenListTags,
      props.areTokensFromBridge,
      props.isRouteAvailable,
      props.modalTitle,
      props.hasChainPanel,
      props.chainsPanelTitle,
      props.hideFavoriteTokensTooltip,
      props.selectedTargetChainId,
      props.onSelectChain,
      props.onClearRecentTokens,
    ],
  )
}
