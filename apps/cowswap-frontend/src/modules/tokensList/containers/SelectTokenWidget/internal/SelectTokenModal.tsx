/**
 * SelectTokenModal - Internal token selector modal
 *
 * Each slot uses its own domain hook - no prop drilling through controller.
 */
import { useSetAtom } from 'jotai'
import React, { MouseEvent, ReactNode, useEffect } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import { addBodyClass, removeBodyClass } from '@cowprotocol/common-utils'
import { Media } from '@cowprotocol/ui'

import { createPortal } from 'react-dom'

import { BlockingView } from './slots/BlockingView'
import { ChainSelector, DesktopChainPanel } from './slots/ChainSelector'
import { Header } from './slots/Header'
import { NetworkPanel } from './slots/NetworkPanel'
import { Search } from './slots/Search'
import { TokenList } from './slots/TokenList'

import { useCloseTokenSelectWidget } from '../../../hooks/useCloseTokenSelectWidget'
import { useSelectTokenWidgetState } from '../../../hooks/useSelectTokenWidgetState'
import { DEFAULT_MODAL_UI_STATE, updateSelectTokenModalUIAtom } from '../atoms'
import { SelectTokenWidgetProps, useSelectTokenWidgetController } from '../controller'
import { useBlockingViewState, useChainPanelState, useHeaderState, useSearchState, useTokenListState } from '../hooks'
import { InnerWrapper, ModalContainer, WidgetCard, WidgetOverlay, Wrapper } from '../styled'
import { useDismissHandler, useManageWidgetVisibility } from '../widgetUIState'

export interface SelectTokenModalProps extends SelectTokenWidgetProps {
  children: ReactNode
}
// Context for standalone prop (needed by child hooks)
const StandaloneContext = React.createContext<boolean>(false)

export function useStandalone(): boolean {
  return React.useContext(StandaloneContext)
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

export function SelectTokenModal({ displayLpTokenLists, standalone, children }: SelectTokenModalProps): ReactNode {
  const { isOpen } = useSelectTokenWidgetController({ displayLpTokenLists, standalone })
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
    <StandaloneContext.Provider value={standalone ?? false}>
      <Wrapper>
        <InnerWrapper $hasSidebar={isChainPanelVisible} $isMobileOverlay={isCompactLayout}>
          <ModalContainer>{children}</ModalContainer>
        </InnerWrapper>
      </Wrapper>
    </StandaloneContext.Provider>
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

// Connected slots that use domain hooks
function ConnectedHeader(): ReactNode {
  const standalone = useStandalone()
  const { closeManageWidget } = useManageWidgetVisibility()
  const closeTokenSelectWidget = useCloseTokenSelectWidget()
  const onDismiss = useDismissHandler(closeManageWidget, closeTokenSelectWidget)
  const { title, showManageButton, onOpenManageWidget } = useHeaderState(standalone)

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
  const { onPressEnter } = useSearchState()
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
  const { isRouteAvailable } = useTokenListState()
  return <TokenList isRouteAvailable={isRouteAvailable} />
}

function ConnectedBlockingView(): ReactNode {
  const standalone = useStandalone()
  const state = useBlockingViewState(standalone)
  return <BlockingView {...state} />
}

// Hook to check if blocking view should be shown
export function useHasBlockingView(): boolean {
  const standalone = useStandalone()
  const { hasBlockingView } = useBlockingViewState(standalone)
  return hasBlockingView
}

// Attach slots
SelectTokenModal.Header = ConnectedHeader
SelectTokenModal.Search = ConnectedSearch
SelectTokenModal.TokenList = ConnectedTokenList
SelectTokenModal.NetworkPanel = NetworkPanel
SelectTokenModal.ChainSelector = ConnectedChainSelector
SelectTokenModal.DesktopChainPanel = ConnectedDesktopChainPanel
SelectTokenModal.BlockingView = ConnectedBlockingView

// Export raw slot components
export { Header, Search, ChainSelector, DesktopChainPanel, TokenList, BlockingView }
