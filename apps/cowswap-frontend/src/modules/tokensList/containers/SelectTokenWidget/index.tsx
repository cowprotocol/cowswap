import { ReactNode, useEffect, useState } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import { addBodyClass, removeBodyClass } from '@cowprotocol/common-utils'
import { Media } from '@cowprotocol/ui'

import { createPortal } from 'react-dom'
import styled, { css } from 'styled-components/macro'

import {
  useSelectTokenWidgetController,
  type SelectTokenWidgetProps,
  type SelectTokenWidgetViewProps,
} from './controller'

import { ChainPanel } from '../../pure/ChainPanel'
import { ImportListModal } from '../../pure/ImportListModal'
import { ImportTokenModal } from '../../pure/ImportTokenModal'
import { SelectTokenModal } from '../../pure/SelectTokenModal'
import { LpTokenPage } from '../LpTokenPage'
import { ManageListsAndTokens } from '../ManageListsAndTokens'

const Wrapper = styled.div<{ $isMobileOverlay?: boolean }>`
  width: 100%;
  height: ${({ $isMobileOverlay }) => ($isMobileOverlay ? '100%' : 'auto')};
`

const InnerWrapper = styled.div<{ $hasSidebar: boolean; $isMobileOverlay?: boolean }>`
  height: ${({ $isMobileOverlay }) => ($isMobileOverlay ? '100%' : 'calc(100vh - 200px)')};
  min-height: ${({ $isMobileOverlay }) => ($isMobileOverlay ? '0' : '600px')};
  width: 100%;
  margin: 0 auto;
  display: flex;
  align-items: stretch;

  ${({ $hasSidebar }) =>
    $hasSidebar &&
    css`
      /* Stack modal + sidebar vertically on narrow screens so neither pane collapses */
      ${Media.upToMedium()} {
        flex-direction: column;
        height: auto;
        min-height: 0;
      }

      ${Media.upToSmall()} {
        min-height: 0;
      }
    `}

  ${({ $isMobileOverlay }) =>
    $isMobileOverlay &&
    css`
      flex-direction: column;
      height: 100%;
      min-height: 0;
    `}
`

const ModalContainer = styled.div<{ $isMobileOverlay?: boolean }>`
  flex: 1;
  min-width: 0;
  display: flex;
  height: ${({ $isMobileOverlay }) => ($isMobileOverlay ? '100%' : 'auto')};
`

export function SelectTokenWidget(props: SelectTokenWidgetProps): ReactNode {
  const controller = useSelectTokenWidgetController(props)
  const isCompactLayout = useMediaQuery(Media.upToMedium(false))
  const [isMobileChainPanelOpen, setIsMobileChainPanelOpen] = useState(false)
  const isChainPanelVisible = controller.hasChainPanel && !isCompactLayout
  const shouldLockScroll = isCompactLayout || isMobileChainPanelOpen
  const { shouldRender } = controller

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

    if (shouldLockScroll) {
      addBodyClass('noScroll')
      return () => removeBodyClass('noScroll')
    }

    removeBodyClass('noScroll')
    return undefined
  }, [shouldLockScroll, shouldRender])

  if (!shouldRender) {
    return null
  }

  const widgetContent = (
    <Wrapper $isMobileOverlay={isCompactLayout}>
      <InnerWrapper $hasSidebar={isChainPanelVisible} $isMobileOverlay={isCompactLayout}>
        <SelectTokenWidgetView
          {...controller.viewProps}
          isChainPanelVisible={isChainPanelVisible}
          isMobileChainPanelOpen={isMobileChainPanelOpen}
          setIsMobileChainPanelOpen={setIsMobileChainPanelOpen}
          isCompactLayout={isCompactLayout}
        />
      </InnerWrapper>
    </Wrapper>
  )

  if (isCompactLayout) {
    const overlay = (
      <MobileWidgetOverlay>
        <MobileWidgetCard>{widgetContent}</MobileWidgetCard>
      </MobileWidgetOverlay>
    )

    if (typeof document === 'undefined') {
      return overlay
    }

    return createPortal(overlay, document.body)
  }

  return widgetContent
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

  const mobileChainsState = !isChainPanelVisible ? chainsToSelect : undefined
  const handleOpenMobileChainPanel = mobileChainsState ? () => setIsMobileChainPanelOpen(true) : undefined
  const showDesktopChainPanel = isChainPanelVisible && isChainPanelEnabled && chainsToSelect
  const showMobileChainPanel =
    !isChainPanelVisible && isChainPanelEnabled && chainsToSelect && isMobileChainPanelOpen

  return (
    <>
      <ModalContainer $isMobileOverlay={isCompactLayout}>
        <SelectTokenModal
          {...selectTokenModalProps}
          hasChainPanel={isChainPanelVisible}
          mobileChainsState={mobileChainsState}
          onSelectChain={mobileChainsState ? onSelectChain : undefined}
          isFullScreenMobile={isCompactLayout}
          onOpenMobileChainPanel={handleOpenMobileChainPanel}
        />
      </ModalContainer>
      {showDesktopChainPanel && (
        <ChainPanel title={chainsPanelTitle} chainsState={chainsToSelect} onSelectChain={onSelectChain} />
      )}
      {showMobileChainPanel &&
        renderMobileChainPanel({
          chainsPanelTitle,
          chainsToSelect,
          onSelectChain,
          onClose: () => setIsMobileChainPanelOpen(false),
        })}
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

function renderMobileChainPanel({
  chainsPanelTitle,
  chainsToSelect,
  onSelectChain,
  onClose,
}: {
  chainsPanelTitle: string
  chainsToSelect: SelectTokenWidgetViewProps['chainsToSelect']
  onSelectChain: SelectTokenWidgetViewProps['onSelectChain']
  onClose(): void
}): ReactNode {
  if (typeof document === 'undefined') {
    return null
  }

  return createPortal(
    <MobileChainPanelOverlay onClick={onClose}>
      <MobileChainPanelCard onClick={(event) => event.stopPropagation()}>
        <ChainPanel
          title={chainsPanelTitle}
          chainsState={chainsToSelect}
          onSelectChain={(chain) => {
            onSelectChain(chain)
            onClose()
          }}
          variant="fullscreen"
          onClose={onClose}
        />
      </MobileChainPanelCard>
    </MobileChainPanelOverlay>,
    document.body,
  )
}

const MobileChainPanelOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1200;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: stretch;
  justify-content: center;
`

const MobileChainPanelCard = styled.div`
  flex: 1;
  max-width: 100%;
  height: 100%;
`

const MobileWidgetOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
`

const MobileWidgetCard = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  padding: 0;
  box-sizing: border-box;
`
