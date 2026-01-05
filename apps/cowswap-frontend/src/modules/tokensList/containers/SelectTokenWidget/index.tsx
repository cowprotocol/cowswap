import { ReactNode } from 'react'

import {
  Header,
  SearchInput,
  ChainSelector,
  DesktopChainPanel,
  TokenList,
  BlockingView,
  useHasBlockingView,
} from './components'
import { SelectTokenWidgetV2 } from './v2'

import * as styledEl from '../../pure/SelectTokenModal/styled'

import type { SelectTokenWidgetProps } from './controller'

/**
 * SelectTokenWidget - Token selector modal
 *
 * This is the main entry point. It uses V2 internally with slot-based composition.
 * The compound component API (SelectTokenWidget.Header, etc.) is preserved for backwards compatibility.
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

  // Blocking views take over the entire modal
  if (hasBlockingView) {
    return <BlockingView />
  }

  // Normal token selection view
  return (
    <>
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
      <SelectTokenWidget.DesktopChainPanel />
    </>
  )
}

interface ModalProps {
  children: ReactNode
}

function Modal({ children }: ModalProps): ReactNode {
  return <styledEl.Wrapper>{children}</styledEl.Wrapper>
}

SelectTokenWidget.Modal = Modal
SelectTokenWidget.Header = Header
SelectTokenWidget.SearchInput = SearchInput
SelectTokenWidget.ChainSelector = ChainSelector
SelectTokenWidget.DesktopChainPanel = DesktopChainPanel
SelectTokenWidget.TokenList = TokenList
SelectTokenWidget.BlockingView = BlockingView
