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
  const { isManageWidgetOpen, openManageWidget, closeManageWidget } = useManageWidgetVisibility()
  const updateSelectTokenWidget = useUpdateSelectTokenWidgetState()
  const { account } = useWalletInfo(),
    closeTokenSelectWidget = useCloseTokenSelectWidget()
  const tokenData = useTokenDataSources(),
    onTokenListAddingError = useOnTokenListAddingError(),
    { addCustomTokenLists, importTokenCallback } = useTokenAdminActions()
  const { modalTitle, chainsPanelTitle, disableErc20, tokenListCategoryState } = useWidgetMetadata(
    resolvedField,
    displayLpTokenLists,
    widgetState.oppositeToken,
    lpTokensWithBalancesCount,
  )
  const onDismiss = useDismissHandler(closeManageWidget, closeTokenSelectWidget),
    { openPoolPage, closePoolPage } = usePoolPageHandlers(updateSelectTokenWidget)
  const importFlows = useImportFlowCallbacks(
      importTokenCallback,
      widgetState.onSelectToken,
      onDismiss,
      addCustomTokenLists,
      onTokenListAddingError,
      updateSelectTokenWidget,
    ),
    handleSelectToken = useTokenSelectionHandler(widgetState.onSelectToken),
    isInjectedWidgetMode = isInjectedWidget(),
    isBridgingEnabled = hasAvailableChains(chainsToSelect)
  const selectTokenModalPropsInput = buildSelectTokenModalPropsInput({
      standalone,
      displayLpTokenLists,
      tokenData,
      widgetState,
      favoriteTokens: standalone ? EMPTY_FAV_TOKENS : tokenData.favoriteTokens,
      handleSelectToken,
      onDismiss,
      onOpenManageWidget: openManageWidget,
      openPoolPage,
      tokenListCategoryState,
      disableErc20,
      account,
      isBridgingEnabled,
      isInjectedWidgetMode,
      modalTitle,
    }),
    selectTokenModalProps = useSelectTokenModalPropsMemo(selectTokenModalPropsInput)
  const viewProps = buildSelectTokenWidgetViewProps({
    standalone,
    tokenToImport: widgetState.tokenToImport,
    listToImport: widgetState.listToImport,
    isManageWidgetOpen,
    selectedPoolAddress: widgetState.selectedPoolAddress,
    isBridgingEnabled,
    chainsPanelTitle,
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

  return {
    shouldRender: Boolean(widgetState.onSelectToken && widgetState.open),
    isBridgingEnabled,
    viewProps,
  }
}

export type { SelectTokenWidgetViewProps } from './controllerProps'
