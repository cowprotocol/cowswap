import { ReactNode } from 'react'

import styled from 'styled-components/macro'

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

const Wrapper = styled.div`
  width: 100%;
`

const InnerWrapper = styled.div<{ $hasSidebar: boolean }>`
  height: calc(100vh - 200px);
  min-height: 600px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  align-items: stretch;
`

const ModalContainer = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
`

export function SelectTokenWidget(props: SelectTokenWidgetProps): ReactNode {
  const controller = useSelectTokenWidgetController(props)

  if (!controller.shouldRender) {
    return null
  }

  return (
    <Wrapper>
      <InnerWrapper $hasSidebar={controller.isBridgingEnabled}>
        <SelectTokenWidgetView {...controller.viewProps} />
      </InnerWrapper>
    </Wrapper>
  )
}

function SelectTokenWidgetView(props: SelectTokenWidgetViewProps): ReactNode {
  const {
    standalone,
    tokenToImport,
    listToImport,
    isManageWidgetOpen,
    selectedPoolAddress,
    isBridgingEnabled,
    chainsPanelTitle,
    chainsToSelect,
    onSelectChain,
    onDismiss,
    onBackFromImport,
    onImportTokens,
    onImportList,
    allTokenLists,
    userAddedTokens,
    onCloseManageWidget,
    onClosePoolPage,
    selectTokenModalProps,
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

  return (
    <>
      <ModalContainer>
        <SelectTokenModal {...selectTokenModalProps} />
      </ModalContainer>
      {isBridgingEnabled && chainsToSelect && (
        <ChainPanel title={chainsPanelTitle} chainsState={chainsToSelect} onSelectChain={onSelectChain} />
      )}
    </>
  )
}
