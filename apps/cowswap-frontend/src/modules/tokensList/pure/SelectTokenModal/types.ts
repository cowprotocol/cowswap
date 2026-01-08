import { ChainInfo } from '@cowprotocol/cow-sdk'
import { TokenListCategory } from '@cowprotocol/tokens'

import { ChainsToSelectState, TokenSelectionHandler } from '../../types'

/**
 * Props that remain on SelectTokenModal after moving data to atom.
 * Children read token data, context, and callbacks from tokenListViewAtom.
 *
 * Props categories:
 * - Callbacks: onDismiss, onOpenManageWidget, onInputPressEnter, onSelectToken, onSelectChain, openPoolPage
 * - Layout: standalone, hasChainPanel, isFullScreenMobile
 * - Strings: modalTitle, chainsPanelTitle, defaultInputValue
 * - Chain panel: chainsToSelect, mobileChainsState, mobileChainsLabel, onOpenMobileChainPanel
 * - Widget config: tokenListCategoryState, disableErc20, isRouteAvailable, account, displayLpTokenLists
 */

export interface ModalLayoutProps {
  standalone?: boolean
  hasChainPanel?: boolean
  isFullScreenMobile?: boolean
  modalTitle?: string
  chainsPanelTitle?: string
  defaultInputValue?: string
}

export interface ChainSelectionProps {
  chainsToSelect?: ChainsToSelectState
  onSelectChain(chain: ChainInfo): void
  mobileChainsState?: ChainsToSelectState
  mobileChainsLabel?: string
  onOpenMobileChainPanel?(): void
}

export interface WidgetConfigProps<T = TokenListCategory[] | null> {
  tokenListCategoryState: [T, (category: T) => void]
  disableErc20?: boolean
  isRouteAvailable: boolean | undefined
  account: string | undefined
  displayLpTokenLists?: boolean
}

export interface ModalCallbackProps {
  onSelectToken: TokenSelectionHandler
  openPoolPage(poolAddress: string): void
  onInputPressEnter?(): void
  onOpenManageWidget(): void
  onDismiss(): void
}

export type SelectTokenModalProps<T = TokenListCategory[] | null> = ModalLayoutProps &
  ChainSelectionProps &
  WidgetConfigProps<T> &
  ModalCallbackProps
