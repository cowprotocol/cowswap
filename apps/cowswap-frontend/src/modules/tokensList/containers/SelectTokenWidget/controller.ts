import { TokenWithLogo } from '@cowprotocol/common-const'
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

const EMPTY_FAV_TOKENS: TokenWithLogo[] = []

export interface SelectTokenWidgetProps {
  displayLpTokenLists?: boolean
  standalone?: boolean
}

export interface SelectTokenWidgetController {
  shouldRender: boolean
  isBridgingEnabled: boolean
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
  const manageWidget = useManageWidgetVisibility()
  const updateSelectTokenWidget = useUpdateSelectTokenWidgetState()
  const { account } = useWalletInfo(),
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

  const { isBridgingEnabled, viewProps } = useSelectTokenWidgetViewState({
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
  })

  return {
    shouldRender: Boolean(widgetState.onSelectToken && widgetState.open),
    isBridgingEnabled,
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
}

interface ViewStateResult {
  isBridgingEnabled: boolean
  viewProps: SelectTokenWidgetViewProps
}

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
  } = args

  const { isManageWidgetOpen, openManageWidget, closeManageWidget } = manageWidget
  const onDismiss = useDismissHandler(closeManageWidget, closeTokenSelectWidget)
  const { openPoolPage, closePoolPage } = usePoolPageHandlers(updateSelectTokenWidget)
  const importFlows = useImportFlowCallbacks(
    tokenAdminActions.importTokenCallback,
    widgetState.onSelectToken,
    onDismiss,
    tokenAdminActions.addCustomTokenLists,
    onTokenListAddingError,
    updateSelectTokenWidget,
  )
  const handleSelectToken = useTokenSelectionHandler(widgetState.onSelectToken)
  const isBridgingEnabled = hasAvailableChains(chainsToSelect)
  const { recentTokens, handleTokenListItemClick } = useRecentTokenSection(
    tokenData.allTokens,
    tokenData.favoriteTokens,
  )
  const selectTokenModalPropsInput = buildSelectTokenModalPropsInput({
      standalone,
      displayLpTokenLists,
      tokenData,
      widgetState,
      favoriteTokens: standalone ? EMPTY_FAV_TOKENS : tokenData.favoriteTokens,
      recentTokens,
      handleSelectToken,
      onTokenListItemClick: handleTokenListItemClick,
      onDismiss,
      onOpenManageWidget: openManageWidget,
      openPoolPage,
      tokenListCategoryState: widgetMetadata.tokenListCategoryState,
      disableErc20: widgetMetadata.disableErc20,
      account,
      isBridgingEnabled,
      isInjectedWidgetMode: isInjectedWidget(),
      modalTitle: widgetMetadata.modalTitle,
    }),
    selectTokenModalProps = useSelectTokenModalPropsMemo(selectTokenModalPropsInput)

  const viewProps = buildSelectTokenWidgetViewProps({
    standalone,
    tokenToImport: widgetState.tokenToImport,
    listToImport: widgetState.listToImport,
    isManageWidgetOpen,
    selectedPoolAddress: widgetState.selectedPoolAddress,
    isBridgingEnabled,
    chainsPanelTitle: widgetMetadata.chainsPanelTitle,
    chainsToSelect,
    onSelectChain,
    onDismiss,
    onBackFromImport: importFlows.resetTokenImport,
    onImportTokens: importFlows.importTokenAndClose,
    onImportList: importFlows.importListAndBack,
    allTokenLists: tokenData.allTokenLists,
    userAddedTokens: tokenData.userAddedTokens,
    onCloseManageWidget: closeManageWidget,
    onClosePoolPage: closePoolPage,
    selectTokenModalProps,
    onSelectToken: handleSelectToken,
  })

  return { isBridgingEnabled, viewProps }
}

export type { SelectTokenWidgetViewProps } from './controllerProps'
