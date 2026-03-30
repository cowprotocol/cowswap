import { ReactNode } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import { Media, SmartModal } from '@cowprotocol/ui'

import { WIDGET_MAX_WIDTH } from 'theme'

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
import { InnerWrapper, ModalContainer, Wrapper } from '../styled'

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

  const chainPanel = useChainPanelState(widgetState.tradeType, widgetState.field)
  const isChainPanelVisible = chainPanel.isEnabled && !isCompactLayout

  useWidgetEffects(isOpen)

  if (!isOpen) return null

  const contentMaxWidth = isCompactLayout
    ? undefined
    : chainPanel.isEnabled
      ? WIDGET_MAX_WIDTH.tokenSelectSidebar
      : WIDGET_MAX_WIDTH.tokenSelect

  return (
    <SmartModal
      isOpen={isOpen}
      onDismiss={onDismiss}
      drawerMediaQuery={Media.upToMedium(false)}
      maxHeight={90}
      contentMaxWidth={contentMaxWidth}
      panelScrolls={false}
    >
      <Wrapper>
        <InnerWrapper $hasSidebar={isChainPanelVisible} $isMobileOverlay={isCompactLayout}>
          <ModalContainer>{children}</ModalContainer>
        </InnerWrapper>
      </Wrapper>
    </SmartModal>
  )
}

// Slot components
SelectTokenModal.Header = ConnectedHeader
SelectTokenModal.Search = ConnectedSearch
SelectTokenModal.TokenList = ConnectedTokenList
SelectTokenModal.Panel = NetworkPanel
SelectTokenModal.ChainSelector = ConnectedChainSelector
SelectTokenModal.DesktopChainPanel = ConnectedDesktopChainPanel

// Blocking views
SelectTokenModal.ImportToken = ImportTokenView
SelectTokenModal.ImportList = ImportListView
SelectTokenModal.Manage = ManageView
SelectTokenModal.LpToken = LpTokenView
