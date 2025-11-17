import { TokenWithLogo } from '@cowprotocol/common-const'

import { buildSelectTokenModalPropsInput, buildSelectTokenWidgetViewProps, useSelectTokenModalPropsMemo } from './controllerProps'
import {
  useManageWidgetVisibility,
  usePoolPageHandlers,
  useRecentTokenSection,
  useTokenDataSources,
  useTokenSelectionHandler,
  useWidgetMetadata,
} from './controllerState'

import { useChainsToSelect } from '../../hooks/useChainsToSelect'
import { useOnSelectChain } from '../../hooks/useOnSelectChain'
import { useSelectTokenWidgetState } from '../../hooks/useSelectTokenWidgetState'

import type { WidgetViewDependenciesResult } from './controllerDependencies'
import type { SelectTokenModalProps } from '../../pure/SelectTokenModal'

const EMPTY_FAV_TOKENS: TokenWithLogo[] = []

interface WidgetModalPropsArgs {
  account: string | undefined
  chainsToSelect: ReturnType<typeof useChainsToSelect>
  displayLpTokenLists?: boolean
  widgetDeps: WidgetViewDependenciesResult
  hasChainPanel: boolean
  onSelectChain: ReturnType<typeof useOnSelectChain>
  recentTokens: ReturnType<typeof useRecentTokenSection>['recentTokens']
  standalone?: boolean
  tokenData: ReturnType<typeof useTokenDataSources>
  widgetMetadata: ReturnType<typeof useWidgetMetadata>
  widgetState: ReturnType<typeof useSelectTokenWidgetState>
  isInjectedWidgetMode: boolean
}

export function useWidgetModalProps({
  account,
  chainsToSelect,
  displayLpTokenLists,
  widgetDeps,
  hasChainPanel,
  onSelectChain,
  recentTokens,
  standalone,
  tokenData,
  widgetMetadata,
  widgetState,
  isInjectedWidgetMode,
}: WidgetModalPropsArgs): SelectTokenModalProps {
  const favoriteTokens = standalone ? EMPTY_FAV_TOKENS : tokenData.favoriteTokens

  return useSelectTokenModalPropsMemo(
    createSelectTokenModalProps({
      account,
      chainsPanelTitle: widgetMetadata.chainsPanelTitle,
      chainsState: chainsToSelect,
      disableErc20: widgetMetadata.disableErc20,
      displayLpTokenLists,
      favoriteTokens,
      handleSelectToken: widgetDeps.handleSelectToken,
      hasChainPanel,
      isInjectedWidgetMode,
      modalTitle: widgetMetadata.modalTitle,
      onDismiss: widgetDeps.onDismiss,
      onSelectChain,
      onTokenListItemClick: widgetDeps.handleTokenListItemClick,
      onClearRecentTokens: widgetDeps.clearRecentTokens,
      onOpenManageWidget: widgetDeps.openManageWidget,
      openPoolPage: widgetDeps.openPoolPage,
      recentTokens,
      standalone,
      tokenData,
      tokenListCategoryState: widgetMetadata.tokenListCategoryState,
      widgetState,
    }),
  )
}

interface BuildViewPropsArgs {
  allTokenLists: ReturnType<typeof useTokenDataSources>['allTokenLists']
  chainsPanelTitle: string
  chainsToSelect: ReturnType<typeof useChainsToSelect>
  closeManageWidget: ReturnType<typeof useManageWidgetVisibility>['closeManageWidget']
  closePoolPage: ReturnType<typeof usePoolPageHandlers>['closePoolPage']
  importFlows: WidgetViewDependenciesResult['importFlows']
  isChainPanelEnabled: boolean
  onDismiss: () => void
  onSelectChain: ReturnType<typeof useOnSelectChain>
  selectTokenModalProps: ReturnType<typeof useSelectTokenModalPropsMemo>
  selectedPoolAddress: ReturnType<typeof useSelectTokenWidgetState>['selectedPoolAddress']
  standalone: boolean | undefined
  tokenToImport: ReturnType<typeof useSelectTokenWidgetState>['tokenToImport']
  listToImport: ReturnType<typeof useSelectTokenWidgetState>['listToImport']
  isManageWidgetOpen: ReturnType<typeof useManageWidgetVisibility>['isManageWidgetOpen']
  userAddedTokens: ReturnType<typeof useTokenDataSources>['userAddedTokens']
  handleSelectToken: ReturnType<typeof useTokenSelectionHandler>
}

type BuildViewPropsInput = Parameters<typeof buildSelectTokenWidgetViewProps>[0]

export function getSelectTokenWidgetViewPropsArgs(args: BuildViewPropsArgs): BuildViewPropsInput {
  const {
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
    importFlows,
    allTokenLists,
    userAddedTokens,
    closeManageWidget,
    closePoolPage,
    selectTokenModalProps,
    handleSelectToken,
  } = args

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
    onBackFromImport: importFlows.resetTokenImport,
    onImportTokens: importFlows.importTokenAndClose,
    onImportList: importFlows.importListAndBack,
    allTokenLists,
    userAddedTokens,
    onCloseManageWidget: closeManageWidget,
    onClosePoolPage: closePoolPage,
    selectTokenModalProps,
    onSelectToken: handleSelectToken,
  }
}

function createSelectTokenModalProps({
  account,
  chainsPanelTitle,
  chainsState,
  disableErc20,
  displayLpTokenLists,
  favoriteTokens,
  handleSelectToken,
  hasChainPanel,
  isInjectedWidgetMode,
  modalTitle,
  onDismiss,
  onSelectChain,
  onTokenListItemClick,
  onClearRecentTokens,
  onOpenManageWidget,
  openPoolPage,
  recentTokens,
  standalone,
  tokenData,
  tokenListCategoryState,
  widgetState,
}: {
  account: string | undefined
  chainsPanelTitle: string
  chainsState: ReturnType<typeof useChainsToSelect>
  disableErc20: boolean
  displayLpTokenLists: boolean | undefined
  favoriteTokens: TokenWithLogo[]
  handleSelectToken: ReturnType<typeof useTokenSelectionHandler>
  hasChainPanel: boolean
  isInjectedWidgetMode: boolean
  modalTitle: string
  onDismiss: () => void
  onSelectChain: ReturnType<typeof useOnSelectChain>
  onTokenListItemClick: ReturnType<typeof useRecentTokenSection>['handleTokenListItemClick']
  onClearRecentTokens: ReturnType<typeof useRecentTokenSection>['clearRecentTokens']
  onOpenManageWidget: ReturnType<typeof useManageWidgetVisibility>['openManageWidget']
  openPoolPage: ReturnType<typeof usePoolPageHandlers>['openPoolPage']
  recentTokens: ReturnType<typeof useRecentTokenSection>['recentTokens']
  standalone: boolean | undefined
  tokenData: ReturnType<typeof useTokenDataSources>
  tokenListCategoryState: ReturnType<typeof useWidgetMetadata>['tokenListCategoryState']
  widgetState: ReturnType<typeof useSelectTokenWidgetState>
}): SelectTokenModalProps {
  return buildSelectTokenModalPropsInput({
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
    chainsPanelTitle,
    onSelectChain,
    isInjectedWidgetMode,
    modalTitle,
  })
}
