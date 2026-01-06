/**
 * LegacyAdapter - Bridges V2 SelectTokenWidget with the existing controller
 *
 * Converts controller state into props for slot components.
 */
import { useAtomValue, useSetAtom } from 'jotai'
import React, { MouseEvent, ReactNode, createContext, useContext, useEffect, useMemo } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import { addBodyClass, removeBodyClass } from '@cowprotocol/common-utils'
import { Media } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { createPortal } from 'react-dom'

import { BlockingView, BlockingViewProps } from './slots/BlockingView'
import { ChainSelector, ChainSelectorProps, DesktopChainPanel, DesktopChainPanelProps } from './slots/ChainSelector'
import { Header, HeaderProps } from './slots/Header'
import { NetworkPanel } from './slots/NetworkPanel'
import { Search, SearchProps } from './slots/Search'
import { TokenList, TokenListProps } from './slots/TokenList'

import { useCloseTokenSelectWidget } from '../../../hooks/useCloseTokenSelectWidget'
import { DEFAULT_MODAL_UI_STATE, selectTokenModalUIAtom, updateSelectTokenModalUIAtom } from '../atoms'
import { SelectTokenWidgetProps, useSelectTokenWidgetController } from '../controller'
import { SelectTokenWidgetViewProps } from '../controllerProps'
import { InnerWrapper, ModalContainer, WidgetCard, WidgetOverlay, Wrapper } from '../styled'

export interface SelectTokenWidgetV2Props extends SelectTokenWidgetProps {
  children: ReactNode
}

type ViewProps = SelectTokenWidgetViewProps

interface SlotProps {
  header: HeaderProps
  search: SearchProps
  chainSelector: ChainSelectorProps
  desktopChainPanel: DesktopChainPanelProps
  tokenList: TokenListProps
  blockingView: BlockingViewProps
  hasBlockingView: boolean
}

const SlotPropsContext = createContext<SlotProps | null>(null)

function useSlotProps(): SlotProps {
  const ctx = useContext(SlotPropsContext)
  if (!ctx) throw new Error('useSlotProps must be used within SelectTokenWidgetV2')
  return ctx
}

function useHeaderProps(viewProps: ViewProps): HeaderProps {
  const p = viewProps.selectTokenModalProps
  return useMemo(
    () => ({
      title: p.modalTitle ?? t`Select token`,
      showManageButton: !viewProps.standalone,
      onDismiss: viewProps.onDismiss,
      onOpenManageWidget: p.onOpenManageWidget,
    }),
    [p.modalTitle, p.onOpenManageWidget, viewProps.standalone, viewProps.onDismiss],
  )
}

function useSearchProps(viewProps: ViewProps): SearchProps {
  const p = viewProps.selectTokenModalProps
  return useMemo(() => ({ onPressEnter: p.onInputPressEnter }), [p.onInputPressEnter])
}

function useChainSelectorProps(viewProps: ViewProps, hasChainPanel: boolean): ChainSelectorProps {
  return useMemo(
    () => ({
      chains: hasChainPanel ? viewProps.chainsToSelect : undefined,
      title: viewProps.chainsPanelTitle ?? t`Cross chain swap`,
      onSelectChain: viewProps.onSelectChain ?? (() => {}),
    }),
    [hasChainPanel, viewProps.chainsToSelect, viewProps.chainsPanelTitle, viewProps.onSelectChain],
  )
}

function useDesktopChainPanelProps(viewProps: ViewProps, isVisible: boolean): DesktopChainPanelProps {
  return useMemo(
    () => ({
      chains: isVisible ? viewProps.chainsToSelect : undefined,
      title: viewProps.chainsPanelTitle ?? t`Cross chain swap`,
      onSelectChain: viewProps.onSelectChain ?? (() => {}),
    }),
    [isVisible, viewProps.chainsToSelect, viewProps.chainsPanelTitle, viewProps.onSelectChain],
  )
}

function useTokenListProps(viewProps: ViewProps): TokenListProps {
  const p = viewProps.selectTokenModalProps
  return useMemo(() => ({ isRouteAvailable: p.isRouteAvailable }), [p.isRouteAvailable])
}

function useBlockingViewProps(viewProps: ViewProps, isManageWidgetOpen: boolean): BlockingViewProps {
  return useMemo(
    () => ({
      standalone: viewProps.standalone,
      tokenToImport: viewProps.tokenToImport,
      listToImport: viewProps.listToImport,
      isManageWidgetOpen,
      selectedPoolAddress: viewProps.selectedPoolAddress,
      allTokenLists: viewProps.allTokenLists,
      userAddedTokens: viewProps.userAddedTokens,
      onDismiss: viewProps.onDismiss,
      onBackFromImport: viewProps.onBackFromImport,
      onImportTokens: viewProps.onImportTokens,
      onImportList: viewProps.onImportList,
      onCloseManageWidget: viewProps.onCloseManageWidget,
      onClosePoolPage: viewProps.onClosePoolPage,
      onSelectToken: viewProps.onSelectToken,
    }),
    [
      viewProps.standalone,
      viewProps.tokenToImport,
      viewProps.listToImport,
      isManageWidgetOpen,
      viewProps.selectedPoolAddress,
      viewProps.allTokenLists,
      viewProps.userAddedTokens,
      viewProps.onDismiss,
      viewProps.onBackFromImport,
      viewProps.onImportTokens,
      viewProps.onImportList,
      viewProps.onCloseManageWidget,
      viewProps.onClosePoolPage,
      viewProps.onSelectToken,
    ],
  )
}

function useHasBlockingViewValue(viewProps: ViewProps, isManageWidgetOpen: boolean): boolean {
  return Boolean(
    (viewProps.tokenToImport && !viewProps.standalone) ||
      (viewProps.listToImport && !viewProps.standalone) ||
      (isManageWidgetOpen && !viewProps.standalone) ||
      viewProps.selectedPoolAddress,
  )
}

function useWidgetEffects(
  shouldRender: boolean,
  isChainPanelVisible: boolean,
  isManageWidgetOpen: boolean,
  closeTokenSelectWidget: ReturnType<typeof useCloseTokenSelectWidget>,
  updateModalUI: ReturnType<typeof useSetAtom<typeof updateSelectTokenModalUIAtom>>,
): void {
  useEffect(() => {
    if (isChainPanelVisible) updateModalUI({ isMobileChainPanelOpen: false })
  }, [updateModalUI, isChainPanelVisible])

  useEffect(() => {
    updateModalUI({ isManageWidgetOpen })
  }, [updateModalUI, isManageWidgetOpen])

  useEffect(() => () => updateModalUI(DEFAULT_MODAL_UI_STATE), [updateModalUI])
  useEffect(() => () => closeTokenSelectWidget({ overrideForceLock: true }), [closeTokenSelectWidget])

  useEffect(() => {
    if (!shouldRender) {
      removeBodyClass('noScroll')
      return
    }
    addBodyClass('noScroll')
    return () => removeBodyClass('noScroll')
  }, [shouldRender])
}

export function SelectTokenWidgetV2({
  displayLpTokenLists,
  standalone,
  children,
}: SelectTokenWidgetV2Props): ReactNode {
  const { shouldRender, hasChainPanel, viewProps } = useSelectTokenWidgetController({ displayLpTokenLists, standalone })
  const isCompactLayout = useMediaQuery(Media.upToMedium(false))
  const isChainPanelVisible = hasChainPanel && !isCompactLayout
  const closeTokenSelectWidget = useCloseTokenSelectWidget()

  const updateModalUI = useSetAtom(updateSelectTokenModalUIAtom)
  const modalUIState = useAtomValue(selectTokenModalUIAtom)

  useWidgetEffects(
    shouldRender,
    isChainPanelVisible,
    viewProps.isManageWidgetOpen,
    closeTokenSelectWidget,
    updateModalUI,
  )

  // Build slot props
  const header = useHeaderProps(viewProps)
  const search = useSearchProps(viewProps)
  const chainSelector = useChainSelectorProps(viewProps, hasChainPanel)
  const desktopChainPanel = useDesktopChainPanelProps(viewProps, isChainPanelVisible)
  const tokenList = useTokenListProps(viewProps)
  const blockingView = useBlockingViewProps(viewProps, modalUIState.isManageWidgetOpen)
  const hasBlockingView = useHasBlockingViewValue(viewProps, modalUIState.isManageWidgetOpen)

  const slotProps = useMemo<SlotProps>(
    () => ({ header, search, chainSelector, desktopChainPanel, tokenList, blockingView, hasBlockingView }),
    [header, search, chainSelector, desktopChainPanel, tokenList, blockingView, hasBlockingView],
  )

  if (!shouldRender) return null

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>): void => {
    if (event.target === event.currentTarget) viewProps.onDismiss()
  }

  const content = (
    <SlotPropsContext.Provider value={slotProps}>
      <Wrapper>
        <InnerWrapper $hasSidebar={isChainPanelVisible} $isMobileOverlay={isCompactLayout}>
          <ModalContainer>{children}</ModalContainer>
        </InnerWrapper>
      </Wrapper>
    </SlotPropsContext.Provider>
  )

  const overlay = (
    <WidgetOverlay onClick={handleOverlayClick}>
      <WidgetCard $isCompactLayout={isCompactLayout} $hasChainPanel={hasChainPanel}>
        {content}
      </WidgetCard>
    </WidgetOverlay>
  )

  return typeof document === 'undefined' ? overlay : createPortal(overlay, document.body)
}

// Connected slot components that read props from context
function ConnectedHeader(): ReactNode {
  const { header } = useSlotProps()
  return <Header {...header} />
}

function ConnectedSearch(): ReactNode {
  const { search } = useSlotProps()
  return <Search {...search} />
}

function ConnectedChainSelector(): ReactNode {
  const { chainSelector } = useSlotProps()
  return <ChainSelector {...chainSelector} />
}

function ConnectedDesktopChainPanel(): ReactNode {
  const { desktopChainPanel } = useSlotProps()
  return <DesktopChainPanel {...desktopChainPanel} />
}

function ConnectedTokenList(): ReactNode {
  const { tokenList } = useSlotProps()
  return <TokenList {...tokenList} />
}

function ConnectedBlockingView(): ReactNode {
  const { blockingView } = useSlotProps()
  return <BlockingView {...blockingView} />
}

// Hook to check if blocking view should be shown
export function useHasBlockingView(): boolean {
  const { hasBlockingView } = useSlotProps()
  return hasBlockingView
}

// Attach connected slots for easy use
SelectTokenWidgetV2.Header = ConnectedHeader
SelectTokenWidgetV2.Search = ConnectedSearch
SelectTokenWidgetV2.TokenList = ConnectedTokenList
SelectTokenWidgetV2.NetworkPanel = NetworkPanel
SelectTokenWidgetV2.ChainSelector = ConnectedChainSelector
SelectTokenWidgetV2.DesktopChainPanel = ConnectedDesktopChainPanel
SelectTokenWidgetV2.BlockingView = ConnectedBlockingView

// Export raw slot components for direct use with props
export { Header, Search, ChainSelector, DesktopChainPanel, TokenList, BlockingView }
