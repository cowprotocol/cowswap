import { TradeType } from 'modules/trade/types'

import { useHydrateTokenListViewAtom } from './controllerAtomHydration'
import { useWidgetViewDependencies } from './controllerDependencies'
import { getSelectTokenWidgetViewPropsArgs, useWidgetModalProps } from './controllerModalProps'
import { SelectTokenWidgetViewProps } from './controllerProps'
import { useTokenAdminActions, useTokenDataSources, useWidgetMetadata } from './tokenDataHooks'
import { hasAvailableChains } from './tokenSelectionHooks'
import { useManageWidgetVisibility } from './widgetUIState'

import { useChainsToSelect } from '../../hooks/useChainsToSelect'
import { useCloseTokenSelectWidget } from '../../hooks/useCloseTokenSelectWidget'
import { useOnSelectChain } from '../../hooks/useOnSelectChain'
import { useOnTokenListAddingError } from '../../hooks/useOnTokenListAddingError'
import { useSelectTokenWidgetState } from '../../hooks/useSelectTokenWidgetState'
import { useUpdateSelectTokenWidgetState } from '../../hooks/useUpdateSelectTokenWidgetState'

export interface SelectTokenWidgetViewStateArgs {
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

// TODO: Re-enable once Yield should support cross-network selection in the modal.
const ENABLE_YIELD_CHAIN_PANEL = false

export function useSelectTokenWidgetViewState(args: SelectTokenWidgetViewStateArgs): ViewStateResult {
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

  // Determine if modal should render (same logic as controller.ts)
  const shouldRender = Boolean(widgetState.onSelectToken && (widgetState.open || widgetState.forceOpen))

  // Determine favorite tokens (empty for standalone mode)
  const favoriteTokens = standalone ? [] : tokenData.favoriteTokens

  // Hydrate the tokenListViewAtom at controller level (only when modal should render)
  // This allows children to read from atom instead of receiving props
  useHydrateTokenListViewAtom({
    shouldRender,
    tokenData,
    widgetState,
    favoriteTokens,
    recentTokens: widgetDeps.recentTokens,
    onClearRecentTokens: widgetDeps.clearRecentTokens,
    onTokenListItemClick: widgetDeps.handleTokenListItemClick,
    handleSelectToken: widgetDeps.handleSelectToken,
    account,
    displayLpTokenLists: displayLpTokenLists ?? false,
  })

  const shouldDisableChainPanelForYield = widgetState.tradeType === TradeType.YIELD && !ENABLE_YIELD_CHAIN_PANEL
  const isChainPanelEnabled =
    isBridgeFeatureEnabled && hasAvailableChains(chainsToSelect) && !shouldDisableChainPanelForYield
  const selectTokenModalProps = useWidgetModalProps({
    account,
    chainsToSelect,
    displayLpTokenLists,
    widgetDeps,
    hasChainPanel: isChainPanelEnabled,
    onSelectChain,
    standalone,
    widgetMetadata,
    widgetState,
    isRouteAvailable: tokenData.isRouteAvailable,
  })

  const viewProps = getSelectTokenWidgetViewPropsArgs({
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
  })

  return { isChainPanelEnabled, viewProps }
}

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
