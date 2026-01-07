/**
 * SelectTokenModal - Internal token selector modal
 *
 * Each slot uses its own domain hook that reads from widget state atom.
 * No context, no prop drilling.
 */
import { useSetAtom } from 'jotai'
import { MouseEvent, ReactNode, useEffect } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import { addBodyClass, removeBodyClass } from '@cowprotocol/common-utils'
import { Media } from '@cowprotocol/ui'

import { createPortal } from 'react-dom'

import { ChainSelector, DesktopChainPanel } from './slots/ChainSelector'
import { Header } from './slots/Header'
import { ImportListView } from './slots/ImportListView'
import { ImportTokenView } from './slots/ImportTokenView'
import { LpTokenView } from './slots/LpTokenView'
import { ManageView } from './slots/ManageView'
import { NetworkPanel } from './slots/NetworkPanel'
import { Search } from './slots/Search'
import { TokenList } from './slots/TokenList'

import { useCloseTokenSelectWidget } from '../../../hooks/useCloseTokenSelectWidget'
import { useSelectTokenWidgetState } from '../../../hooks/useSelectTokenWidgetState'
import { DEFAULT_MODAL_UI_STATE, updateSelectTokenModalUIAtom } from '../atoms'
import { useActiveBlockingView, useWidgetOpenState } from '../hooks'
import { useChainPanelState, useHeaderState, useSearchState, useTokenListState } from '../hooks'
import { InnerWrapper, ModalContainer, WidgetCard, WidgetOverlay, Wrapper } from '../styled'
import { useDismissHandler, useManageWidgetVisibility } from '../widgetUIState'

export interface SelectTokenModalProps {
  children: ReactNode
}

function useWidgetEffects(isOpen: boolean): void {
  const closeTokenSelectWidget = useCloseTokenSelectWidget()
  const updateModalUI = useSetAtom(updateSelectTokenModalUIAtom)

  useEffect(() => () => updateModalUI(DEFAULT_MODAL_UI_STATE), [updateModalUI])
  useEffect(() => () => closeTokenSelectWidget({ overrideForceLock: true }), [closeTokenSelectWidget])

  useEffect(() => {
    if (!isOpen) {
      removeBodyClass('noScroll')
      return
    }
    addBodyClass('noScroll')
    return () => removeBodyClass('noScroll')
  }, [isOpen])
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

// Connected slots - each reads what it needs from hooks/atoms directly
function ConnectedHeader(): ReactNode {
  const { closeManageWidget } = useManageWidgetVisibility()
  const closeTokenSelectWidget = useCloseTokenSelectWidget()
  const onDismiss = useDismissHandler(closeManageWidget, closeTokenSelectWidget)
  const { title, showManageButton, onOpenManageWidget } = useHeaderState()

  return (
    <Header
      title={title}
      showManageButton={showManageButton}
      onDismiss={onDismiss}
      onOpenManageWidget={onOpenManageWidget}
    />
  )
}

function ConnectedSearch(): ReactNode {
  const onPressEnter = useSearchState()
  return <Search onPressEnter={onPressEnter} />
}

function ConnectedChainSelector(): ReactNode {
  const widgetState = useSelectTokenWidgetState()
  const chainPanel = useChainPanelState(widgetState.tradeType)

  if (!chainPanel.isEnabled) return null

  return <ChainSelector chains={chainPanel.chainsToSelect} onSelectChain={chainPanel.onSelectChain} />
}

function ConnectedDesktopChainPanel(): ReactNode {
  const widgetState = useSelectTokenWidgetState()
  const chainPanel = useChainPanelState(widgetState.tradeType)
  const isCompactLayout = useMediaQuery(Media.upToMedium(false))

  if (!chainPanel.isEnabled || isCompactLayout) return null

  return <DesktopChainPanel chains={chainPanel.chainsToSelect} onSelectChain={chainPanel.onSelectChain} />
}

function ConnectedTokenList(): ReactNode {
  const isRouteAvailable = useTokenListState()
  return <TokenList isRouteAvailable={isRouteAvailable} />
}

// Hook to check which blocking view is active
export { useActiveBlockingView }

// Attach slots
SelectTokenModal.Header = ConnectedHeader
SelectTokenModal.Search = ConnectedSearch
SelectTokenModal.TokenList = ConnectedTokenList
SelectTokenModal.NetworkPanel = NetworkPanel
SelectTokenModal.ChainSelector = ConnectedChainSelector
SelectTokenModal.DesktopChainPanel = ConnectedDesktopChainPanel

// Blocking view slots (each with its own focused hook)
SelectTokenModal.ImportTokenView = ImportTokenView
SelectTokenModal.ImportListView = ImportListView
SelectTokenModal.ManageView = ManageView
SelectTokenModal.LpTokenView = LpTokenView

// Export raw slot components
export { Header, Search, ChainSelector, DesktopChainPanel, TokenList }
export { ImportTokenView, ImportListView, ManageView, LpTokenView }
