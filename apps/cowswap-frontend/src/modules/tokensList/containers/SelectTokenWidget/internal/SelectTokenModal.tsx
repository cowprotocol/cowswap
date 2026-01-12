import { MouseEvent, ReactNode } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import { Media } from '@cowprotocol/ui'

import { createPortal } from 'react-dom'

import {
  ConnectedChainSelector,
  ConnectedDesktopChainPanel,
  ConnectedHeader,
  ConnectedSearch,
  ConnectedTokenList,
  ImportListView,
  ImportTokenView,
  LpTokenView,
  ManageView,
  NetworkPanel,
} from './slots'

import { useCloseTokenSelectWidget } from '../../../hooks/useCloseTokenSelectWidget'
import { useSelectTokenWidgetState } from '../../../hooks/useSelectTokenWidgetState'
import {
  useChainPanelState,
  useDismissHandler,
  useManageWidgetVisibility,
  useWidgetEffects,
  useWidgetOpenState,
} from '../hooks'
import { InnerWrapper, ModalContainer, WidgetCard, WidgetOverlay, Wrapper } from '../styled'

export interface RootProps {
  children: ReactNode
}

export function Root({ children }: RootProps): ReactNode {
  const isOpen = useWidgetOpenState()
  const isCompactLayout = useMediaQuery(Media.upToMedium(false))
  const widgetState = useSelectTokenWidgetState()
  const { closeManageWidget } = useManageWidgetVisibility()
  const closeTokenSelectWidget = useCloseTokenSelectWidget()
  const onDismiss = useDismissHandler(closeManageWidget, closeTokenSelectWidget)

  const chainPanel = useChainPanelState(widgetState.tradeType)
  const isChainPanelVisible = chainPanel.isEnabled && !isCompactLayout

  useWidgetEffects(isOpen)

  if (!isOpen) return null

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>): void => {
    if (event.target === event.currentTarget) onDismiss()
  }

  const content = (
    <Wrapper>
      <InnerWrapper $hasSidebar={isChainPanelVisible} $isMobileOverlay={isCompactLayout}>
        <ModalContainer>{children}</ModalContainer>
      </InnerWrapper>
    </Wrapper>
  )

  const overlay = (
    <WidgetOverlay onClick={handleOverlayClick}>
      <WidgetCard $isCompactLayout={isCompactLayout} $hasChainPanel={chainPanel.isEnabled}>
        {content}
      </WidgetCard>
    </WidgetOverlay>
  )

  return typeof document === 'undefined' ? overlay : createPortal(overlay, document.body)
}

Root.displayName = 'SelectTokenModal.Root'

// Slot components
export const Header: typeof ConnectedHeader = ConnectedHeader
export const Search: typeof ConnectedSearch = ConnectedSearch
export const TokenList: typeof ConnectedTokenList = ConnectedTokenList
export const Panel: typeof NetworkPanel = NetworkPanel
export const ChainSelector: typeof ConnectedChainSelector = ConnectedChainSelector
export const DesktopChainPanel: typeof ConnectedDesktopChainPanel = ConnectedDesktopChainPanel

// Blocking views
export const ImportToken: typeof ImportTokenView = ImportTokenView
export const ImportList: typeof ImportListView = ImportListView
export const Manage: typeof ManageView = ManageView
export const LpToken: typeof LpTokenView = LpTokenView
