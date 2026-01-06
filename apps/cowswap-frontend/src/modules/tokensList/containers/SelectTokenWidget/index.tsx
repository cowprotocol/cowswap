import { ReactNode } from 'react'

import { SelectTokenWidgetV2 } from './v2'
import { BlockingView, ChainSelector, DesktopChainPanel, Header, Search, TokenList } from './v2/slots'
import { useHasBlockingView } from './v2/store'

import * as styledEl from '../../pure/SelectTokenModal/styled'

import type { SelectTokenWidgetProps } from './controller'

/**
 * SelectTokenWidget - Token selector modal
 *
 * Uses V2 architecture with slot-based composition.
 * All slots read from the V2 store (TokenSelectorProvider).
 */
export function SelectTokenWidget(props: SelectTokenWidgetProps): ReactNode {
  return (
    <SelectTokenWidgetV2 {...props}>
      <SelectTokenWidgetContent />
    </SelectTokenWidgetV2>
  )
}

function SelectTokenWidgetContent(): ReactNode {
  const hasBlockingView = useHasBlockingView()

  if (hasBlockingView) {
    return <BlockingView />
  }

  return (
    <>
      <SelectTokenWidget.Modal>
        <Header />
        <Search />
        <ChainSelector />
        <styledEl.Body>
          <styledEl.TokenColumn>
            <TokenList />
          </styledEl.TokenColumn>
        </styledEl.Body>
      </SelectTokenWidget.Modal>
      <DesktopChainPanel />
    </>
  )
}

interface ModalProps {
  children: ReactNode
}

function Modal({ children }: ModalProps): ReactNode {
  return <styledEl.Wrapper>{children}</styledEl.Wrapper>
}

// Compound component API (for external use)
SelectTokenWidget.Modal = Modal
SelectTokenWidget.Header = Header
SelectTokenWidget.Search = Search
SelectTokenWidget.ChainSelector = ChainSelector
SelectTokenWidget.DesktopChainPanel = DesktopChainPanel
SelectTokenWidget.TokenList = TokenList
SelectTokenWidget.BlockingView = BlockingView
