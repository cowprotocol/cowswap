import { ReactNode } from 'react'

import {
  useSelectTokenWidgetController,
  type SelectTokenWidgetProps,
  type SelectTokenWidgetViewProps,
} from './controller'
import { InnerWrapper, ModalContainer, Wrapper } from './styled'

import { ChainPanel } from '../../pure/ChainPanel'
import { ImportListModal } from '../../pure/ImportListModal'
import { ImportTokenModal } from '../../pure/ImportTokenModal'
import { SelectTokenModal } from '../../pure/SelectTokenModal'
import { LpTokenPage } from '../LpTokenPage'
import { ManageListsAndTokens } from '../ManageListsAndTokens'

export function SelectTokenWidget(props: SelectTokenWidgetProps): ReactNode {
  const { shouldRender, hasChainPanel, viewProps } = useSelectTokenWidgetController(props)

  if (!shouldRender) {
    return null
  }

  return (
    <Wrapper>
      <InnerWrapper $hasSidebar={hasChainPanel}>
        <SelectTokenWidgetView {...viewProps} isChainPanelVisible={hasChainPanel} />
      </InnerWrapper>
    </Wrapper>
  )
}

function SelectTokenWidgetView(
  props: SelectTokenWidgetViewProps & {
    isChainPanelVisible: boolean
  },
): ReactNode {
  const {
    isChainPanelVisible,
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

  const showDesktopChainPanel = isChainPanelVisible && isChainPanelEnabled && chainsToSelect

  return (
    <>
      <ModalContainer>
        <SelectTokenModal {...selectTokenModalProps} hasChainPanel={isChainPanelVisible} />
      </ModalContainer>
      {showDesktopChainPanel && (
        <ChainPanel title={chainsPanelTitle} chainsState={chainsToSelect} onSelectChain={onSelectChain} />
      )}
    </>
  )
}

function getBlockingView(props: SelectTokenWidgetViewProps): ReactNode | null {
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
