import { useTokenAdminActions, useTokenDataSources } from './tokenDataHooks'
import { useImportFlowCallbacks, useRecentTokenSection, useTokenSelectionHandler } from './tokenSelectionHooks'
import { useDismissHandler, useManageWidgetVisibility, usePoolPageHandlers } from './widgetUIState'

import { useCloseTokenSelectWidget } from '../../hooks/useCloseTokenSelectWidget'
import { useOnTokenListAddingError } from '../../hooks/useOnTokenListAddingError'
import { useSelectTokenWidgetState } from '../../hooks/useSelectTokenWidgetState'
import { useUpdateSelectTokenWidgetState } from '../../hooks/useUpdateSelectTokenWidgetState'

export interface WidgetViewDependenciesResult {
  isManageWidgetOpen: boolean
  openManageWidget: ReturnType<typeof useManageWidgetVisibility>['openManageWidget']
  closeManageWidget: ReturnType<typeof useManageWidgetVisibility>['closeManageWidget']
  onDismiss(): void
  openPoolPage: ReturnType<typeof usePoolPageHandlers>['openPoolPage']
  closePoolPage: ReturnType<typeof usePoolPageHandlers>['closePoolPage']
  recentTokens: ReturnType<typeof useRecentTokenSection>['recentTokens']
  handleTokenListItemClick: ReturnType<typeof useRecentTokenSection>['handleTokenListItemClick']
  clearRecentTokens: ReturnType<typeof useRecentTokenSection>['clearRecentTokens']
  handleSelectToken: ReturnType<typeof useTokenSelectionHandler>
  importFlows: ReturnType<typeof useImportFlowCallbacks>
}

interface WidgetViewDependenciesArgs {
  manageWidget: ReturnType<typeof useManageWidgetVisibility>
  closeTokenSelectWidget: ReturnType<typeof useCloseTokenSelectWidget>
  updateSelectTokenWidget: ReturnType<typeof useUpdateSelectTokenWidgetState>
  tokenData: ReturnType<typeof useTokenDataSources>
  tokenAdminActions: ReturnType<typeof useTokenAdminActions>
  onTokenListAddingError: ReturnType<typeof useOnTokenListAddingError>
  widgetState: ReturnType<typeof useSelectTokenWidgetState>
  activeChainId: number | undefined
}

export function useWidgetViewDependencies({
  manageWidget,
  closeTokenSelectWidget,
  updateSelectTokenWidget,
  tokenData,
  tokenAdminActions,
  onTokenListAddingError,
  widgetState,
  activeChainId,
}: WidgetViewDependenciesArgs): WidgetViewDependenciesResult {
  const { isManageWidgetOpen, openManageWidget, closeManageWidget } = manageWidget
  const onDismiss = useDismissHandler(closeManageWidget, closeTokenSelectWidget)
  const { openPoolPage, closePoolPage } = usePoolPageHandlers(updateSelectTokenWidget)
  const { recentTokens, handleTokenListItemClick, clearRecentTokens } = useRecentTokenSection(
    tokenData.allTokens,
    tokenData.favoriteTokens,
    activeChainId,
  )
  const handleSelectToken = useTokenSelectionHandler(widgetState.onSelectToken, widgetState)
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
    clearRecentTokens,
    handleSelectToken,
    importFlows,
  }
}
