/**
 * SelectTokenModal - Internal token selector modal
 *
 * Each slot uses its own domain hook. No context, no prop drilling.
 */
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

export interface SelectTokenModalProps {
  children: ReactNode
}

export function SelectTokenModal({ children }: SelectTokenModalProps): ReactNode {
  const isOpen = useWidgetOpenState()
  const isCompactLayout = useMediaQuery(Media.upToMedium(false))
  const widgetState = useSelectTokenWidgetState()
  const { closeManageWidget } = useManageWidgetVisibility()
  const closeTokenSelectWidget = useCloseTokenSelectWidget()
  const onDismiss = useDismissHandler(closeManageWidget, closeTokenSelectWidget)

  // Chain panel state
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

SelectTokenModal.Header = ConnectedHeader
SelectTokenModal.Search = ConnectedSearch
SelectTokenModal.TokenList = ConnectedTokenList
SelectTokenModal.NetworkPanel = NetworkPanel
SelectTokenModal.ChainSelector = ConnectedChainSelector
SelectTokenModal.DesktopChainPanel = ConnectedDesktopChainPanel
SelectTokenModal.ImportTokenView = ImportTokenView
SelectTokenModal.ImportListView = ImportListView
SelectTokenModal.ManageView = ManageView
SelectTokenModal.LpTokenView = LpTokenView
