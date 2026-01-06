import { TokenWithLogo } from '@cowprotocol/common-const'
import { ChainInfo } from '@cowprotocol/cow-sdk'
import { ListState } from '@cowprotocol/tokens'

import { ChainsToSelectState, TokenSelectionHandler } from '../../types'

import type { TokenListCategoryState } from './tokenDataHooks'
import type { SelectTokenModalProps } from '../../pure/SelectTokenModal'

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

/**
 * Arguments for building modal props.
 * Token data, context, and atom-backed callbacks are hydrated to atom by controller.
 */
interface BuildModalPropsArgs {
  // Layout
  standalone?: boolean
  hasChainPanel: boolean
  modalTitle: string
  chainsPanelTitle: string
  // Chain panel
  chainsState?: ChainsToSelectState
  onSelectChain?(chain: ChainInfo): void
  // Widget config
  displayLpTokenLists?: boolean
  tokenListCategoryState: TokenListCategoryState
  disableErc20: boolean
  isRouteAvailable: boolean | undefined
  account: string | undefined
  // Callbacks
  handleSelectToken: TokenSelectionHandler
  onDismiss(): void
  onOpenManageWidget(): void
  openPoolPage(poolAddress: string): void
  onInputPressEnter?(): void
}

/**
 * Builds SelectTokenModalProps.
 * Token data and context are now hydrated to atom by controller - modal doesn't receive them.
 */
export function buildSelectTokenModalPropsInput({
  // Layout
  standalone,
  hasChainPanel,
  modalTitle,
  chainsPanelTitle,
  // Chain panel
  chainsState,
  onSelectChain,
  // Widget config
  displayLpTokenLists,
  tokenListCategoryState,
  disableErc20,
  isRouteAvailable,
  account,
  // Callbacks
  handleSelectToken,
  onDismiss,
  onOpenManageWidget,
  openPoolPage,
  onInputPressEnter,
}: BuildModalPropsArgs): SelectTokenModalProps {
  const selectChainHandler: (chain: ChainInfo) => void = onSelectChain ?? (() => undefined)

  return {
    // Layout
    standalone,
    hasChainPanel,
    modalTitle,
    chainsPanelTitle,
    // Chain panel
    chainsToSelect: chainsState,
    onSelectChain: selectChainHandler,
    mobileChainsState: chainsState,
    mobileChainsLabel: chainsPanelTitle,
    // Widget config
    displayLpTokenLists,
    tokenListCategoryState,
    disableErc20,
    isRouteAvailable,
    account,
    // Callbacks
    onSelectToken: handleSelectToken,
    onDismiss,
    onOpenManageWidget,
    openPoolPage,
    onInputPressEnter,
  }
}
