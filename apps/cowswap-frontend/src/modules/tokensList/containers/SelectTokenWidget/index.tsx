import { MouseEvent, ReactNode, useEffect, useRef, useState } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import { addBodyClass, removeBodyClass } from '@cowprotocol/common-utils'
import { Media } from '@cowprotocol/ui'

import { createPortal } from 'react-dom'

import {
  useSelectTokenWidgetController,
  type SelectTokenWidgetProps,
  type SelectTokenWidgetViewProps,
} from './controller'
import { MobileChainPanelPortal } from './MobileChainPanelPortal'
import { InnerWrapper, ModalContainer, WidgetCard, WidgetOverlay, Wrapper } from './styled'

import { useCloseTokenSelectWidget } from '../../hooks/useCloseTokenSelectWidget'
import { ChainPanel } from '../../pure/ChainPanel'
import { ImportListModal } from '../../pure/ImportListModal'
import { ImportTokenModal } from '../../pure/ImportTokenModal'
import { SelectTokenModal } from '../../pure/SelectTokenModal'
import { LpTokenPage } from '../LpTokenPage'
import { ManageListsAndTokens } from '../ManageListsAndTokens'

export function SelectTokenWidget(props: SelectTokenWidgetProps): ReactNode {
  const { shouldRender, hasChainPanel, viewProps } = useSelectTokenWidgetController(props)
  const isCompactLayout = useMediaQuery(Media.upToMedium(false))
  const [isMobileChainPanelOpen, setIsMobileChainPanelOpen] = useState(false)
  const isChainPanelVisible = hasChainPanel && !isCompactLayout
  const closeTokenSelectWidget = useCloseTokenSelectWidget()

  const closeTokenSelectWidgetRef =
    useRef<ReturnType<typeof useCloseTokenSelectWidget>>(closeTokenSelectWidget)

  useEffect(() => {
    closeTokenSelectWidgetRef.current = closeTokenSelectWidget
  }, [closeTokenSelectWidget])

  useEffect(() => {
    return () => {
      closeTokenSelectWidgetRef.current?.({ overrideForceLock: true })
    }
  }, [])

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

  const widgetContent = (
    <Wrapper>
      <InnerWrapper $hasSidebar={isChainPanelVisible} $isMobileOverlay={isCompactLayout}>
        <SelectTokenWidgetView
          {...viewProps}
          isChainPanelVisible={isChainPanelVisible}
          isMobileChainPanelOpen={isMobileChainPanelOpen}
          setIsMobileChainPanelOpen={setIsMobileChainPanelOpen}
          isCompactLayout={isCompactLayout}
        />
      </InnerWrapper>
    </Wrapper>
  )

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>): void => {
    if (event.target !== event.currentTarget) {
      return
    }

    viewProps.onDismiss()
  }

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

function SelectTokenWidgetView(
  props: SelectTokenWidgetViewProps & {
    isChainPanelVisible: boolean
    isCompactLayout: boolean
    isMobileChainPanelOpen: boolean
    setIsMobileChainPanelOpen(value: boolean): void
  },
): ReactNode {
  const {
    isChainPanelVisible,
    isCompactLayout,
    isMobileChainPanelOpen,
    setIsMobileChainPanelOpen,
    isChainPanelEnabled,
    chainsPanelTitle,
    chainsToSelect,
    onSelectChain,
    selectTokenModalProps,
  } = props

  const blockingView = getBlockingView(props)

  if (blockingView) {
    return blockingView
  }

  const closeMobileChainPanel = (): void => setIsMobileChainPanelOpen(false)
  const mobileChainsState = isChainPanelEnabled && !isChainPanelVisible ? chainsToSelect : undefined
  const handleOpenMobileChainPanel = mobileChainsState ? () => setIsMobileChainPanelOpen(true) : undefined
  const showDesktopChainPanel = isChainPanelVisible && isChainPanelEnabled && chainsToSelect
  const showMobileChainPanel = !isChainPanelVisible && isChainPanelEnabled && chainsToSelect && isMobileChainPanelOpen
  const modalChainsToSelect = isChainPanelVisible ? undefined : chainsToSelect

  return (
    <>
      <ModalContainer>
        <SelectTokenModal
          {...selectTokenModalProps}
          hasChainPanel={isChainPanelVisible}
          chainsToSelect={modalChainsToSelect}
          mobileChainsState={mobileChainsState}
          onSelectChain={onSelectChain}
          isFullScreenMobile={isCompactLayout}
          onOpenMobileChainPanel={handleOpenMobileChainPanel}
        />
      </ModalContainer>
      {showDesktopChainPanel && (
        <ChainPanel title={chainsPanelTitle} chainsState={chainsToSelect} onSelectChain={onSelectChain} />
      )}
      {showMobileChainPanel && (
        <MobileChainPanelPortal
          chainsPanelTitle={chainsPanelTitle}
          chainsToSelect={chainsToSelect}
          onSelectChain={onSelectChain}
          onClose={closeMobileChainPanel}
        />
      )}
    </>
  )
}

function getBlockingView(
  props: SelectTokenWidgetViewProps & {
    isChainPanelVisible: boolean
    isCompactLayout: boolean
    isMobileChainPanelOpen: boolean
    setIsMobileChainPanelOpen(value: boolean): void
  },
): ReactNode | null {
  const {
    standalone,
    tokenToImport,
    listToImport,
    isManageWidgetOpen,
    selectedPoolAddress,
    allTokenLists,
    userAddedTokens,
    onDismiss,
    onBackFromImport,
    onImportTokens,
    onImportList,
    onCloseManageWidget,
    onClosePoolPage,
    onSelectToken,
  } = props

  if (tokenToImport && !standalone) {
    return (
      <ImportTokenModal
        tokens={[tokenToImport]}
        onDismiss={onDismiss}
        onBack={onBackFromImport}
        onImport={onImportTokens}
      />
    )
  }

  if (listToImport && !standalone) {
    return (
      <ImportListModal list={listToImport} onDismiss={onDismiss} onBack={onBackFromImport} onImport={onImportList} />
    )
  }

  if (isManageWidgetOpen && !standalone) {
    return (
      <ManageListsAndTokens
        lists={allTokenLists}
        customTokens={userAddedTokens}
        onDismiss={onDismiss}
        onBack={onCloseManageWidget}
      />
    )
  }

  if (selectedPoolAddress) {
    return (
      <LpTokenPage
        poolAddress={selectedPoolAddress}
        onDismiss={onDismiss}
        onBack={onClosePoolPage}
        onSelectToken={onSelectToken}
      />
    )
  }

  return null
}
