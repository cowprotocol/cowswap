import { useIsBridgingEnabled } from '@cowprotocol/common-hooks'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Field } from 'legacy/state/types'

import { useLpTokensWithBalances } from 'modules/yield/shared'

import { SelectTokenWidgetViewProps } from './controllerProps'
import {
  useManageWidgetVisibility,
  useTokenAdminActions,
  useTokenDataSources,
  useWidgetMetadata,
} from './controllerState'
import { useSelectTokenWidgetViewState } from './controllerViewState'

import { useChainsToSelect } from '../../hooks/useChainsToSelect'
import { useCloseTokenSelectWidget } from '../../hooks/useCloseTokenSelectWidget'
import { useOnSelectChain } from '../../hooks/useOnSelectChain'
import { useOnTokenListAddingError } from '../../hooks/useOnTokenListAddingError'
import { useSelectTokenWidgetState } from '../../hooks/useSelectTokenWidgetState'
import { useUpdateSelectTokenWidgetState } from '../../hooks/useUpdateSelectTokenWidgetState'

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
  const widgetState = useSelectTokenWidgetState()
  const { count: lpTokensWithBalancesCount } = useLpTokensWithBalances()
  const resolvedField = widgetState.field ?? Field.INPUT
  const chainsToSelect = useChainsToSelect()
  const onSelectChain = useOnSelectChain()
  const isBridgeFeatureEnabled = useIsBridgingEnabled()
  const manageWidget = useManageWidgetVisibility()
  const updateSelectTokenWidget = useUpdateSelectTokenWidgetState()
  const { account, chainId: walletChainId } = useWalletInfo()
  const closeTokenSelectWidget = useCloseTokenSelectWidget()
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
    shouldRender: Boolean(widgetState.onSelectToken && (widgetState.open || widgetState.forceOpen)),
    hasChainPanel: isChainPanelEnabled,
    viewProps,
  }
}

export type { SelectTokenWidgetViewProps } from './controllerProps'
