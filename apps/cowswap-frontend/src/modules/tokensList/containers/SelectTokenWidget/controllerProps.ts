import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { ChainInfo } from '@cowprotocol/cow-sdk'
import { ListState } from '@cowprotocol/tokens'

import { ChainsToSelectState } from '../../types'

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
  isBridgingEnabled: boolean
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
  onSelectToken(token: TokenWithLogo): void
}

interface BuildViewPropsArgs {
  standalone?: boolean
  tokenToImport?: TokenWithLogo
  listToImport?: ListState
  isManageWidgetOpen: boolean
  selectedPoolAddress?: string
  isBridgingEnabled: boolean
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
  onSelectToken(token: TokenWithLogo): void
}

interface BuildModalPropsArgs {
  standalone?: boolean
  displayLpTokenLists?: boolean
  tokenData: TokenDataSources
  widgetState: WidgetState
  favoriteTokens: TokenWithLogo[]
  handleSelectToken(token: TokenWithLogo): void
  onDismiss(): void
  onOpenManageWidget(): void
  openPoolPage(poolAddress: string): void
  tokenListCategoryState: TokenListCategoryState
  disableErc20: boolean
  account: string | undefined
  isBridgingEnabled: boolean
  isInjectedWidgetMode: boolean
  modalTitle: string
}

export function buildSelectTokenWidgetViewProps({
  standalone,
  tokenToImport,
  listToImport,
  isManageWidgetOpen,
  selectedPoolAddress,
  isBridgingEnabled,
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
    isBridgingEnabled,
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
  handleSelectToken,
  onDismiss,
  onOpenManageWidget,
  openPoolPage,
  tokenListCategoryState,
  disableErc20,
  account,
  isBridgingEnabled,
  isInjectedWidgetMode,
  modalTitle,
}: BuildModalPropsArgs): SelectTokenModalProps {
  return {
    standalone,
    displayLpTokenLists,
    unsupportedTokens: tokenData.unsupportedTokens,
    selectedToken: widgetState.selectedToken,
    allTokens: tokenData.allTokens,
    favoriteTokens,
    balancesState: tokenData.balancesState,
    permitCompatibleTokens: tokenData.permitCompatibleTokens,
    onSelectToken: handleSelectToken,
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
    hasChainPanel: isBridgingEnabled,
    hideFavoriteTokensTooltip: isInjectedWidgetMode,
    selectedTargetChainId: widgetState.selectedTargetChainId,
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
      balancesState: props.balancesState,
      permitCompatibleTokens: props.permitCompatibleTokens,
      onSelectToken: props.onSelectToken,
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
      selectedTargetChainId: props.selectedTargetChainId,
    }),
    [
      props.standalone,
      props.displayLpTokenLists,
      props.unsupportedTokens,
      props.selectedToken,
      props.allTokens,
      props.favoriteTokens,
      props.balancesState,
      props.permitCompatibleTokens,
      props.onSelectToken,
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
      props.hideFavoriteTokensTooltip,
      props.selectedTargetChainId,
    ],
  )
}
