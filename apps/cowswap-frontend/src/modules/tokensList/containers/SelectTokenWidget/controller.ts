import { TokenWithLogo } from '@cowprotocol/common-const'
import { useIsBridgingEnabled } from '@cowprotocol/common-hooks'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Field } from 'legacy/state/types'

import { useLpTokensWithBalances } from 'modules/yield/shared'

import {
  SelectTokenWidgetViewProps,
  buildSelectTokenModalPropsInput,
  buildSelectTokenWidgetViewProps,
  useSelectTokenModalPropsMemo,
} from './controllerProps'
import {
  hasAvailableChains,
  useDismissHandler,
  useImportFlowCallbacks,
  useManageWidgetVisibility,
  usePoolPageHandlers,
  useTokenAdminActions,
  useTokenDataSources,
  useTokenSelectionHandler,
  useWidgetMetadata,
  useRecentTokenSection,
} from './controllerState'

import { useChainsToSelect } from '../../hooks/useChainsToSelect'
import { useCloseTokenSelectWidget } from '../../hooks/useCloseTokenSelectWidget'
import { useOnSelectChain } from '../../hooks/useOnSelectChain'
import { useOnTokenListAddingError } from '../../hooks/useOnTokenListAddingError'
import { useSelectTokenWidgetState } from '../../hooks/useSelectTokenWidgetState'
import { useUpdateSelectTokenWidgetState } from '../../hooks/useUpdateSelectTokenWidgetState'

import type { SelectTokenModalProps } from '../../pure/SelectTokenModal'

const EMPTY_FAV_TOKENS: TokenWithLogo[] = []

export interface SelectTokenWidgetProps {
  displayLpTokenLists?: boolean
  standalone?: boolean
}

export interface SelectTokenWidgetController {
  shouldRender: boolean
  hasChainPanel: boolean
  viewProps: SelectTokenWidgetViewProps
}

export function useSelectTokenWidgetController({
  displayLpTokenLists,
  standalone,
}: SelectTokenWidgetProps): SelectTokenWidgetController {
  const widgetState = useSelectTokenWidgetState(),
    { count: lpTokensWithBalancesCount } = useLpTokensWithBalances(),
    resolvedField = widgetState.field ?? Field.INPUT
  const chainsToSelect = useChainsToSelect(),
    onSelectChain = useOnSelectChain()
  const isBridgeFeatureEnabled = useIsBridgingEnabled()
  const manageWidget = useManageWidgetVisibility()
  const updateSelectTokenWidget = useUpdateSelectTokenWidgetState()
  const { account, chainId: walletChainId } = useWalletInfo(),
    closeTokenSelectWidget = useCloseTokenSelectWidget()
  const tokenData = useTokenDataSources()
  const onTokenListAddingError = useOnTokenListAddingError()
  const tokenAdminActions = useTokenAdminActions()
  const widgetMetadata = useWidgetMetadata(
    resolvedField,
    displayLpTokenLists,
    widgetState.oppositeToken,
    lpTokensWithBalancesCount,
  )

  const { isChainPanelEnabled, viewProps } = useSelectTokenWidgetViewState({
    displayLpTokenLists,
    standalone,
    widgetState,
    chainsToSelect,
    onSelectChain,
    manageWidget,
    updateSelectTokenWidget,
    account,
    closeTokenSelectWidget,
    tokenData,
    onTokenListAddingError,
    tokenAdminActions,
    widgetMetadata,
    walletChainId,
    isBridgeFeatureEnabled,
  })

  return {
    shouldRender: Boolean(widgetState.onSelectToken && widgetState.open),
    hasChainPanel: isChainPanelEnabled,
    viewProps,
  }
}

interface ViewStateArgs {
  displayLpTokenLists?: boolean
  standalone?: boolean
  widgetState: ReturnType<typeof useSelectTokenWidgetState>
  chainsToSelect: ReturnType<typeof useChainsToSelect>
  onSelectChain: ReturnType<typeof useOnSelectChain>
  manageWidget: ReturnType<typeof useManageWidgetVisibility>
  updateSelectTokenWidget: ReturnType<typeof useUpdateSelectTokenWidgetState>
  account: string | undefined
  closeTokenSelectWidget: ReturnType<typeof useCloseTokenSelectWidget>
  tokenData: ReturnType<typeof useTokenDataSources>
  onTokenListAddingError: ReturnType<typeof useOnTokenListAddingError>
  tokenAdminActions: ReturnType<typeof useTokenAdminActions>
  widgetMetadata: ReturnType<typeof useWidgetMetadata>
  walletChainId?: number
  isBridgeFeatureEnabled: boolean
}

interface ViewStateResult {
  isChainPanelEnabled: boolean
  viewProps: SelectTokenWidgetViewProps
}

type BuildViewPropsInput = Parameters<typeof buildSelectTokenWidgetViewProps>[0]

function useSelectTokenWidgetViewState(args: ViewStateArgs): ViewStateResult {
  const {
    displayLpTokenLists,
    standalone,
    widgetState,
    chainsToSelect,
    onSelectChain,
    manageWidget,
    updateSelectTokenWidget,
    account,
    closeTokenSelectWidget,
    tokenData,
    onTokenListAddingError,
    tokenAdminActions,
    widgetMetadata,
    walletChainId,
    isBridgeFeatureEnabled,
  } = args

  const activeChainId = resolveActiveChainId(widgetState, walletChainId)
  const widgetDeps = useWidgetViewDependencies({
    manageWidget,
    closeTokenSelectWidget,
    updateSelectTokenWidget,
    tokenData,
    tokenAdminActions,
    onTokenListAddingError,
    widgetState,
    activeChainId,
  })
  const isChainPanelEnabled = isBridgeFeatureEnabled && hasAvailableChains(chainsToSelect)
  const selectTokenModalProps = useWidgetModalProps({
    account,
    chainsToSelect,
    displayLpTokenLists,
    handleSelectToken: widgetDeps.handleSelectToken,
    handleTokenListItemClick: widgetDeps.handleTokenListItemClick,
    hasChainPanel: isChainPanelEnabled,
    onDismiss: widgetDeps.onDismiss,
    onSelectChain,
    openManageWidget: widgetDeps.openManageWidget,
    openPoolPage: widgetDeps.openPoolPage,
    recentTokens: widgetDeps.recentTokens,
    standalone,
    tokenData,
    widgetMetadata,
    widgetState,
    isInjectedWidgetMode: isInjectedWidget(),
  })

  const viewProps = buildSelectTokenWidgetViewProps(
    getSelectTokenWidgetViewPropsArgs({
      allTokenLists: tokenData.allTokenLists,
      chainsPanelTitle: widgetMetadata.chainsPanelTitle,
      chainsToSelect,
      closeManageWidget: widgetDeps.closeManageWidget,
      closePoolPage: widgetDeps.closePoolPage,
      importFlows: widgetDeps.importFlows,
      isChainPanelEnabled,
      onDismiss: widgetDeps.onDismiss,
      onSelectChain,
      selectTokenModalProps,
      selectedPoolAddress: widgetState.selectedPoolAddress,
      standalone,
      tokenToImport: widgetState.tokenToImport,
      listToImport: widgetState.listToImport,
      isManageWidgetOpen: widgetDeps.isManageWidgetOpen,
      userAddedTokens: tokenData.userAddedTokens,
      handleSelectToken: widgetDeps.handleSelectToken,
    }),
  )

  return { isChainPanelEnabled, viewProps }
}

export type { SelectTokenWidgetViewProps } from './controllerProps'

function resolveActiveChainId(
  widgetState: ReturnType<typeof useSelectTokenWidgetState>,
  walletChainId?: number,
): number | undefined {
  return (
    widgetState.selectedTargetChainId ??
    walletChainId ??
    extractChainId(widgetState.oppositeToken) ??
    extractChainId(widgetState.selectedToken)
  )
}

function extractChainId(token: { chainId?: number } | undefined | null): number | undefined {
  return typeof token?.chainId === 'number' ? token.chainId : undefined
}

interface WidgetViewDependenciesResult {
  isManageWidgetOpen: boolean
  openManageWidget: ReturnType<typeof useManageWidgetVisibility>['openManageWidget']
  closeManageWidget: ReturnType<typeof useManageWidgetVisibility>['closeManageWidget']
  onDismiss(): void
  openPoolPage: ReturnType<typeof usePoolPageHandlers>['openPoolPage']
  closePoolPage: ReturnType<typeof usePoolPageHandlers>['closePoolPage']
  recentTokens: ReturnType<typeof useRecentTokenSection>['recentTokens']
  handleTokenListItemClick: ReturnType<typeof useRecentTokenSection>['handleTokenListItemClick']
  handleSelectToken: ReturnType<typeof useTokenSelectionHandler>
  importFlows: ReturnType<typeof useImportFlowCallbacks>
}

function useWidgetViewDependencies({
  manageWidget,
  closeTokenSelectWidget,
  updateSelectTokenWidget,
  tokenData,
  tokenAdminActions,
  onTokenListAddingError,
  widgetState,
  activeChainId,
}: {
  manageWidget: ReturnType<typeof useManageWidgetVisibility>
  closeTokenSelectWidget: ReturnType<typeof useCloseTokenSelectWidget>
  updateSelectTokenWidget: ReturnType<typeof useUpdateSelectTokenWidgetState>
  tokenData: ReturnType<typeof useTokenDataSources>
  tokenAdminActions: ReturnType<typeof useTokenAdminActions>
  onTokenListAddingError: ReturnType<typeof useOnTokenListAddingError>
  widgetState: ReturnType<typeof useSelectTokenWidgetState>
  activeChainId: number | undefined
}): WidgetViewDependenciesResult {
  const { isManageWidgetOpen, openManageWidget, closeManageWidget } = manageWidget
  const onDismiss = useDismissHandler(closeManageWidget, closeTokenSelectWidget)
  const { openPoolPage, closePoolPage } = usePoolPageHandlers(updateSelectTokenWidget)
  const { recentTokens, handleTokenListItemClick } = useRecentTokenSection(
    tokenData.allTokens,
    tokenData.favoriteTokens,
    activeChainId,
  )
  const handleSelectToken = useTokenSelectionHandler(widgetState.onSelectToken)
  const importFlows = useImportFlowCallbacks(
    tokenAdminActions.importTokenCallback,
    handleSelectToken,
    onDismiss,
    tokenAdminActions.addCustomTokenLists,
    onTokenListAddingError,
    updateSelectTokenWidget,
    tokenData.favoriteTokens,
  )

  return {
    isManageWidgetOpen,
    openManageWidget,
    closeManageWidget,
    onDismiss,
    openPoolPage,
    closePoolPage,
    recentTokens,
    handleTokenListItemClick,
    handleSelectToken,
    importFlows,
  }
}

function useWidgetModalProps({
  account,
  chainsToSelect,
  displayLpTokenLists,
  handleSelectToken,
  handleTokenListItemClick,
  hasChainPanel,
  onDismiss,
  onSelectChain,
  openManageWidget,
  openPoolPage,
  recentTokens,
  standalone,
  tokenData,
  widgetMetadata,
  widgetState,
  isInjectedWidgetMode,
}: {
  account: string | undefined
  chainsToSelect: ReturnType<typeof useChainsToSelect>
  displayLpTokenLists?: boolean
  handleSelectToken: ReturnType<typeof useTokenSelectionHandler>
  handleTokenListItemClick: ReturnType<typeof useRecentTokenSection>['handleTokenListItemClick']
  hasChainPanel: boolean
  onDismiss: () => void
  onSelectChain: ReturnType<typeof useOnSelectChain>
  openManageWidget: ReturnType<typeof useManageWidgetVisibility>['openManageWidget']
  openPoolPage: ReturnType<typeof usePoolPageHandlers>['openPoolPage']
  recentTokens: ReturnType<typeof useRecentTokenSection>['recentTokens']
  standalone?: boolean
  tokenData: ReturnType<typeof useTokenDataSources>
  widgetMetadata: ReturnType<typeof useWidgetMetadata>
  widgetState: ReturnType<typeof useSelectTokenWidgetState>
  isInjectedWidgetMode: boolean
}): SelectTokenModalProps {
  const favoriteTokens = standalone ? EMPTY_FAV_TOKENS : tokenData.favoriteTokens

  return useSelectTokenModalPropsMemo(
    createSelectTokenModalProps({
      account,
      chainsPanelTitle: widgetMetadata.chainsPanelTitle,
      chainsState: chainsToSelect,
      disableErc20: widgetMetadata.disableErc20,
      displayLpTokenLists,
      favoriteTokens,
      handleSelectToken,
      hasChainPanel,
      isInjectedWidgetMode,
      modalTitle: widgetMetadata.modalTitle,
      onDismiss,
      onSelectChain,
      onTokenListItemClick: handleTokenListItemClick,
      onOpenManageWidget: openManageWidget,
      openPoolPage,
      recentTokens,
      standalone,
      tokenData,
      tokenListCategoryState: widgetMetadata.tokenListCategoryState,
      widgetState,
    }),
  )
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

function getSelectTokenWidgetViewPropsArgs({
  allTokenLists,
  chainsPanelTitle,
  chainsToSelect,
  closeManageWidget,
  closePoolPage,
  importFlows,
  isChainPanelEnabled,
  onDismiss,
  onSelectChain,
  selectTokenModalProps,
  selectedPoolAddress,
  standalone,
  tokenToImport,
  listToImport,
  isManageWidgetOpen,
  userAddedTokens,
  handleSelectToken,
}: {
  allTokenLists: ReturnType<typeof useTokenDataSources>['allTokenLists']
  chainsPanelTitle: string
  chainsToSelect: ReturnType<typeof useChainsToSelect>
  closeManageWidget: ReturnType<typeof useManageWidgetVisibility>['closeManageWidget']
  closePoolPage: ReturnType<typeof usePoolPageHandlers>['closePoolPage']
  importFlows: ReturnType<typeof useImportFlowCallbacks>
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
}): BuildViewPropsInput {
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
