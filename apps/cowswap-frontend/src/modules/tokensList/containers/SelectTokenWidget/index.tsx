import { MouseEvent, ReactNode, useEffect, useState } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import { addBodyClass, removeBodyClass } from '@cowprotocol/common-utils'
import { Media } from '@cowprotocol/ui'

import { createPortal } from 'react-dom'

import {
  Header,
  SearchInput,
  ChainSelector,
  DesktopChainPanel,
  TokenList,
  BlockingView,
  useHasBlockingView,
} from './components'
import { useSelectTokenWidgetController, type SelectTokenWidgetProps } from './controller'
import { SelectTokenWidgetProvider } from './SelectTokenWidgetContext'
import { InnerWrapper, ModalContainer, WidgetCard, WidgetOverlay, Wrapper } from './styled'
import { useWidgetContext } from './useWidgetContext'

import { useCloseTokenSelectWidget } from '../../hooks/useCloseTokenSelectWidget'
import * as styledEl from '../../pure/SelectTokenModal/styled'

// ============================================================================
// Main Component
// ============================================================================

export function SelectTokenWidget(props: SelectTokenWidgetProps): ReactNode {
  const { shouldRender, hasChainPanel, viewProps } = useSelectTokenWidgetController(props)
  const isCompactLayout = useMediaQuery(Media.upToMedium(false))
  const [isMobileChainPanelOpen, setIsMobileChainPanelOpen] = useState(false)
  const isChainPanelVisible = hasChainPanel && !isCompactLayout
  const closeTokenSelectWidget = useCloseTokenSelectWidget()

  // Build context from controller props
  const contextValue = useWidgetContext({
    viewProps,
    isChainPanelVisible,
    isCompactLayout,
    isMobileChainPanelOpen,
    setIsMobileChainPanelOpen,
  })

  // Cleanup: reset widget state on unmount
  useEffect(() => {
    return () => {
      closeTokenSelectWidget({ overrideForceLock: true })
    }
  }, [closeTokenSelectWidget])

  useEffect(() => {
    if (!shouldRender) {
      return
    }

    if (isChainPanelVisible) {
      setIsMobileChainPanelOpen(false)
    }
  }, [isChainPanelVisible, shouldRender])

  useEffect(() => {
    if (!shouldRender) {
      removeBodyClass('noScroll')
      return undefined
    }

    addBodyClass('noScroll')
    return () => removeBodyClass('noScroll')
  }, [shouldRender])

  if (!shouldRender) {
    return null
  }

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>): void => {
    if (event.target !== event.currentTarget) {
      return
    }

    viewProps.onDismiss()
  }

  const widgetContent = (
    <SelectTokenWidgetProvider value={contextValue}>
      <Wrapper>
        <InnerWrapper $hasSidebar={isChainPanelVisible} $isMobileOverlay={isCompactLayout}>
          <SelectTokenWidgetContent />
        </InnerWrapper>
      </Wrapper>
    </SelectTokenWidgetProvider>
  )

  const overlay = (
    <WidgetOverlay onClick={handleOverlayClick}>
      <WidgetCard $isCompactLayout={isCompactLayout} $hasChainPanel={hasChainPanel}>
        {widgetContent}
      </WidgetCard>
    </WidgetOverlay>
  )

  if (typeof document === 'undefined') {
    return overlay
  }

  return createPortal(overlay, document.body)
}

// ============================================================================
// Compound Component: Main Content
// Uses context - no props needed
// ============================================================================

function SelectTokenWidgetContent(): ReactNode {
  const hasBlockingView = useHasBlockingView()

  // Blocking views take over the entire modal
  if (hasBlockingView) {
    return (
      <ModalContainer>
        <BlockingView />
      </ModalContainer>
    )
  }

  // Normal token selection view using compound components
  return (
    <>
      <ModalContainer>
        <SelectTokenWidget.Modal>
          <SelectTokenWidget.Header />
          <SelectTokenWidget.SearchInput />
          <SelectTokenWidget.ChainSelector />
          <styledEl.Body>
            <styledEl.TokenColumn>
              <SelectTokenWidget.TokenList />
            </styledEl.TokenColumn>
          </styledEl.Body>
        </SelectTokenWidget.Modal>
      </ModalContainer>
      <SelectTokenWidget.DesktopChainPanel />
    </>
  )
}

// ============================================================================
// Compound Component: Modal Shell
// ============================================================================

interface ModalProps {
  children: ReactNode
}

function Modal({ children }: ModalProps): ReactNode {
  return <styledEl.Wrapper>{children}</styledEl.Wrapper>
}

// ============================================================================
// Static Properties - Compound Component Pattern
// ============================================================================

SelectTokenWidget.Modal = Modal
SelectTokenWidget.Header = Header
SelectTokenWidget.SearchInput = SearchInput
SelectTokenWidget.ChainSelector = ChainSelector
SelectTokenWidget.DesktopChainPanel = DesktopChainPanel
SelectTokenWidget.TokenList = TokenList
SelectTokenWidget.BlockingView = BlockingView
