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
import { TokenSelectorProvider, TokenSelectorStore } from './store'

import { useCloseTokenSelectWidget } from '../../../hooks/useCloseTokenSelectWidget'
import { DEFAULT_MODAL_UI_STATE, selectTokenModalUIAtom, updateSelectTokenModalUIAtom } from '../atoms'
import { SelectTokenWidgetProps, useSelectTokenWidgetController } from '../controller'
import { InnerWrapper, ModalContainer, WidgetCard, WidgetOverlay, Wrapper } from '../styled'

export interface SelectTokenWidgetV2Props extends SelectTokenWidgetProps {
  children: ReactNode
}

function useWidgetEffects(
  shouldRender: boolean,
  isChainPanelVisible: boolean,
  isManageWidgetOpen: boolean,
  closeTokenSelectWidget: ReturnType<typeof useCloseTokenSelectWidget>,
  updateModalUI: ReturnType<typeof useSetAtom<typeof updateSelectTokenModalUIAtom>>,
): void {
  useEffect(() => {
    if (isChainPanelVisible) {
      updateModalUI({ isMobileChainPanelOpen: false })
    }
  }, [updateModalUI, isChainPanelVisible])

  useEffect(() => {
    updateModalUI({ isManageWidgetOpen })
  }, [updateModalUI, isManageWidgetOpen])

  useEffect(() => {
    return () => updateModalUI(DEFAULT_MODAL_UI_STATE)
  }, [updateModalUI])

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
}

function useBuildStore(
  viewProps: ReturnType<typeof useSelectTokenWidgetController>['viewProps'],
  isCompactLayout: boolean,
  isChainPanelVisible: boolean,
  hasChainPanel: boolean,
  modalUIState: { isMobileChainPanelOpen: boolean; isManageWidgetOpen: boolean },
  onOpenMobileChainPanel: () => void,
  onCloseMobileChainPanel: () => void,
): TokenSelectorStore {
  const { selectTokenModalProps } = viewProps

  return useMemo<TokenSelectorStore>(
    () => ({
      title: selectTokenModalProps.modalTitle ?? t`Select token`,
      showManageButton: !viewProps.standalone,
      chainsPanelTitle: viewProps.chainsPanelTitle ?? t`Cross chain swap`,
      chainsToSelect: viewProps.chainsToSelect,
      displayLpTokenLists: selectTokenModalProps.displayLpTokenLists ?? false,
      tokenListCategoryState: selectTokenModalProps.tokenListCategoryState,
      disableErc20: selectTokenModalProps.disableErc20 ?? false,
      isRouteAvailable: selectTokenModalProps.isRouteAvailable,
      account: selectTokenModalProps.account,
      standalone: viewProps.standalone ?? false,
      tokenToImport: viewProps.tokenToImport,
      listToImport: viewProps.listToImport,
      selectedPoolAddress: viewProps.selectedPoolAddress,
      allTokenLists: viewProps.allTokenLists,
      userAddedTokens: viewProps.userAddedTokens,
      isCompactLayout,
      isChainPanelVisible,
      isChainPanelEnabled: hasChainPanel,
      isMobileChainPanelOpen: modalUIState.isMobileChainPanelOpen,
      isManageWidgetOpen: modalUIState.isManageWidgetOpen,
      onDismiss: viewProps.onDismiss,
      onOpenManageWidget: selectTokenModalProps.onOpenManageWidget,
      onInputPressEnter: selectTokenModalProps.onInputPressEnter,
      onSelectChain: viewProps.onSelectChain,
      onSelectToken: viewProps.onSelectToken,
      openPoolPage: selectTokenModalProps.openPoolPage,
      onBackFromImport: viewProps.onBackFromImport,
      onImportTokens: viewProps.onImportTokens,
      onImportList: viewProps.onImportList,
      onCloseManageWidget: viewProps.onCloseManageWidget,
      onClosePoolPage: viewProps.onClosePoolPage,
      onOpenMobileChainPanel,
      onCloseMobileChainPanel,
    }),
    [
      viewProps,
      selectTokenModalProps,
      isCompactLayout,
      isChainPanelVisible,
      hasChainPanel,
      modalUIState,
      onOpenMobileChainPanel,
      onCloseMobileChainPanel,
    ],
  )
}

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

  const store = useBuildStore(
    viewProps,
    isCompactLayout,
    isChainPanelVisible,
    hasChainPanel,
    modalUIState,
    onOpenMobileChainPanel,
    onCloseMobileChainPanel,
  )

  if (!shouldRender) return null

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>): void => {
    if (event.target === event.currentTarget) viewProps.onDismiss()
  }

  const content = (
    <TokenSelectorProvider value={store}>
      <Wrapper>
        <InnerWrapper $hasSidebar={isChainPanelVisible} $isMobileOverlay={isCompactLayout}>
          <ModalContainer>{children}</ModalContainer>
        </InnerWrapper>
      </Wrapper>
    </TokenSelectorProvider>
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
