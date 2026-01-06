/**
 * LegacyAdapter - Bridges V2 SelectTokenWidget with the existing controller
 */
import { useAtomValue, useSetAtom } from 'jotai'
import { MouseEvent, ReactNode, useCallback, useEffect, useMemo } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import { addBodyClass, removeBodyClass } from '@cowprotocol/common-utils'
import { Media } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { createPortal } from 'react-dom'

import { BlockingView } from './slots/BlockingView'
import { ChainSelector, DesktopChainPanel } from './slots/ChainSelector'
import { Header } from './slots/Header'
import { NetworkPanel } from './slots/NetworkPanel'
import { Search } from './slots/Search'
import { TokenList } from './slots/TokenList'
import {
  BlockingViewProvider,
  BlockingViewStore,
  ChainProvider,
  ChainStore,
  HeaderProvider,
  HeaderStore,
  SearchProvider,
  SearchStore,
  TokenListProvider,
  TokenListStore,
} from './store'

import { useCloseTokenSelectWidget } from '../../../hooks/useCloseTokenSelectWidget'
import { DEFAULT_MODAL_UI_STATE, selectTokenModalUIAtom, updateSelectTokenModalUIAtom } from '../atoms'
import { SelectTokenWidgetProps, useSelectTokenWidgetController } from '../controller'
import { SelectTokenWidgetViewProps } from '../controllerProps'
import { InnerWrapper, ModalContainer, WidgetCard, WidgetOverlay, Wrapper } from '../styled'

export interface SelectTokenWidgetV2Props extends SelectTokenWidgetProps {
  children: ReactNode
}

type ViewProps = SelectTokenWidgetViewProps

function useHeaderStore(viewProps: ViewProps): HeaderStore {
  return useMemo(
    () => ({
      title: viewProps.selectTokenModalProps.modalTitle ?? t`Select token`,
      showManageButton: !viewProps.standalone,
      onDismiss: viewProps.onDismiss,
      onOpenManageWidget: viewProps.selectTokenModalProps.onOpenManageWidget,
    }),
    [
      viewProps.selectTokenModalProps.modalTitle,
      viewProps.selectTokenModalProps.onOpenManageWidget,
      viewProps.standalone,
      viewProps.onDismiss,
    ],
  )
}

function useSearchStoreValue(viewProps: ViewProps): SearchStore {
  return useMemo(
    () => ({ onPressEnter: viewProps.selectTokenModalProps.onInputPressEnter }),
    [viewProps.selectTokenModalProps.onInputPressEnter],
  )
}

interface ChainStoreParams {
  viewProps: ViewProps
  hasChainPanel: boolean
  isChainPanelVisible: boolean
  isCompactLayout: boolean
  isMobileChainPanelOpen: boolean
  onOpenMobileChainPanel: () => void
  onCloseMobileChainPanel: () => void
}

function useChainStoreValue(params: ChainStoreParams): ChainStore {
  return useMemo(
    () => ({
      isEnabled: params.hasChainPanel,
      isVisible: params.isChainPanelVisible,
      title: params.viewProps.chainsPanelTitle ?? t`Cross chain swap`,
      chainsToSelect: params.viewProps.chainsToSelect,
      isMobileChainPanelOpen: params.isMobileChainPanelOpen,
      isCompactLayout: params.isCompactLayout,
      onSelectChain: params.viewProps.onSelectChain,
      onOpenMobileChainPanel: params.onOpenMobileChainPanel,
      onCloseMobileChainPanel: params.onCloseMobileChainPanel,
    }),
    [params],
  )
}

function useTokenListStoreValue(viewProps: ViewProps): TokenListStore {
  const p = viewProps.selectTokenModalProps
  return useMemo(
    () => ({
      displayLpTokenLists: p.displayLpTokenLists ?? false,
      tokenListCategoryState: p.tokenListCategoryState,
      disableErc20: p.disableErc20 ?? false,
      isRouteAvailable: p.isRouteAvailable,
      account: p.account,
      onSelectToken: viewProps.onSelectToken,
      openPoolPage: p.openPoolPage,
    }),
    [p, viewProps.onSelectToken],
  )
}

function useBlockingViewStoreValue(viewProps: ViewProps, isManageWidgetOpen: boolean): BlockingViewStore {
  return useMemo(
    () => ({
      standalone: viewProps.standalone ?? false,
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
    [viewProps, isManageWidgetOpen],
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

  const onOpenMobileChainPanel = useCallback(() => updateModalUI({ isMobileChainPanelOpen: true }), [updateModalUI])
  const onCloseMobileChainPanel = useCallback(() => updateModalUI({ isMobileChainPanelOpen: false }), [updateModalUI])

  useWidgetEffects(
    shouldRender,
    isChainPanelVisible,
    viewProps.isManageWidgetOpen,
    closeTokenSelectWidget,
    updateModalUI,
  )

  const header = useHeaderStore(viewProps)
  const search = useSearchStoreValue(viewProps)
  const chain = useChainStoreValue({
    viewProps,
    hasChainPanel,
    isChainPanelVisible,
    isCompactLayout,
    isMobileChainPanelOpen: modalUIState.isMobileChainPanelOpen,
    onOpenMobileChainPanel,
    onCloseMobileChainPanel,
  })
  const tokenList = useTokenListStoreValue(viewProps)
  const blockingView = useBlockingViewStoreValue(viewProps, modalUIState.isManageWidgetOpen)

  if (!shouldRender) return null

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>): void => {
    if (event.target === event.currentTarget) viewProps.onDismiss()
  }

  const content = (
    <HeaderProvider value={header}>
      <SearchProvider value={search}>
        <ChainProvider value={chain}>
          <TokenListProvider value={tokenList}>
            <BlockingViewProvider value={blockingView}>
              <Wrapper>
                <InnerWrapper $hasSidebar={isChainPanelVisible} $isMobileOverlay={isCompactLayout}>
                  <ModalContainer>{children}</ModalContainer>
                </InnerWrapper>
              </Wrapper>
            </BlockingViewProvider>
          </TokenListProvider>
        </ChainProvider>
      </SearchProvider>
    </HeaderProvider>
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

SelectTokenWidgetV2.Header = Header
SelectTokenWidgetV2.Search = Search
SelectTokenWidgetV2.TokenList = TokenList
SelectTokenWidgetV2.NetworkPanel = NetworkPanel
SelectTokenWidgetV2.ChainSelector = ChainSelector
SelectTokenWidgetV2.DesktopChainPanel = DesktopChainPanel
SelectTokenWidgetV2.BlockingView = BlockingView
