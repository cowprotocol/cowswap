/**
 * LegacyAdapter - Bridges V2 SelectTokenWidget with the existing controller
 *
 * This adapter wraps V2 and connects it to the existing:
 * - useSelectTokenWidgetController (data source)
 * - useWidgetSetup (atom hydration)
 * - Existing blocking views, chain panel, etc.
 *
 * Usage:
 *   <SelectTokenWidgetV2 displayLpTokenLists>
 *     <SelectTokenWidgetV2.Header />
 *     <SelectTokenWidgetV2.Search />
 *     <SelectTokenWidgetV2.TokenList />
 *   </SelectTokenWidgetV2>
 */
import { MouseEvent, ReactNode, useEffect } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import { addBodyClass, removeBodyClass } from '@cowprotocol/common-utils'
import { Media } from '@cowprotocol/ui'

import { createPortal } from 'react-dom'

import { SelectTokenWidget, SelectTokenWidgetProps as V2Props } from './SelectTokenWidget'
import { BlockingView } from './slots/BlockingView'
import { ChainSelector, DesktopChainPanel } from './slots/ChainSelector'
import { Header } from './slots/Header'
import { NetworkPanel } from './slots/NetworkPanel'
import { Search } from './slots/Search'
import { TokenList } from './slots/TokenList'

import { useCloseTokenSelectWidget } from '../../../hooks/useCloseTokenSelectWidget'
import { WidgetCallbacksProvider, WidgetConfigProvider } from '../context'
import { SelectTokenWidgetProps, useSelectTokenWidgetController } from '../controller'
import { useWidgetSetup } from '../hooks'
import { InnerWrapper, ModalContainer, WidgetCard, WidgetOverlay, Wrapper } from '../styled'

export interface SelectTokenWidgetV2Props extends SelectTokenWidgetProps {
  children: ReactNode
}

/**
 * V2 Widget that uses the existing controller for data but allows
 * custom composition of slots via children.
 */
export function SelectTokenWidgetV2({
  displayLpTokenLists,
  standalone,
  children,
}: SelectTokenWidgetV2Props): ReactNode {
  const { shouldRender, hasChainPanel, viewProps } = useSelectTokenWidgetController({
    displayLpTokenLists,
    standalone,
  })
  const isCompactLayout = useMediaQuery(Media.upToMedium(false))
  const isChainPanelVisible = hasChainPanel && !isCompactLayout
  const closeTokenSelectWidget = useCloseTokenSelectWidget()

  // Setup atoms and get provider values
  const { callbacks, config } = useWidgetSetup({
    viewProps,
    isChainPanelVisible,
    isCompactLayout,
    isChainPanelEnabled: hasChainPanel,
  })

  // Cleanup: reset widget state on unmount
  useEffect(() => {
    return () => {
      closeTokenSelectWidget({ overrideForceLock: true })
    }
  }, [closeTokenSelectWidget])

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

  // Bridge to V2: Convert controller data to V2 props
  const v2Props: Omit<V2Props, 'children'> = {
    onSelect: viewProps.onSelectToken,
    onDismiss: viewProps.onDismiss,
    chains: viewProps.chainsToSelect,
    onSelectChain: viewProps.onSelectChain,
  }

  const widgetContent = (
    <WidgetCallbacksProvider value={callbacks}>
      <WidgetConfigProvider value={config}>
        <SelectTokenWidget {...v2Props}>
          <Wrapper>
            <InnerWrapper $hasSidebar={isChainPanelVisible} $isMobileOverlay={isCompactLayout}>
              <ModalContainer>{children}</ModalContainer>
            </InnerWrapper>
          </Wrapper>
        </SelectTokenWidget>
      </WidgetConfigProvider>
    </WidgetCallbacksProvider>
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

// Attach slots
SelectTokenWidgetV2.Header = Header
SelectTokenWidgetV2.Search = Search
SelectTokenWidgetV2.TokenList = TokenList
SelectTokenWidgetV2.NetworkPanel = NetworkPanel
SelectTokenWidgetV2.ChainSelector = ChainSelector
SelectTokenWidgetV2.DesktopChainPanel = DesktopChainPanel
SelectTokenWidgetV2.BlockingView = BlockingView
