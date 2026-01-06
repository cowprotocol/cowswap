import { ReactNode } from 'react'

import { SelectTokenModal, useHasBlockingView } from './internal'

import * as styledEl from '../../pure/SelectTokenModal/styled'

import type { SelectTokenWidgetProps } from './controller'

/**
 * SelectTokenWidget - Token selector modal
 *
 * Uses slot-based composition architecture.
 * Slots get their props from a context, reducing prop drilling.
 */
export function SelectTokenWidget(props: SelectTokenWidgetProps): ReactNode {
  return (
    <SelectTokenModal {...props}>
      <SelectTokenWidgetContent />
    </SelectTokenModal>
  )
}

function SelectTokenWidgetContent(): ReactNode {
  const hasBlockingView = useHasBlockingView()

  if (hasBlockingView) {
    return <SelectTokenModal.BlockingView />
  }

  return (
    <>
      <styledEl.Wrapper>
        <SelectTokenModal.Header />
        <SelectTokenModal.Search />
        <SelectTokenModal.ChainSelector />
        <styledEl.Body>
          <styledEl.TokenColumn>
            <SelectTokenModal.TokenList />
          </styledEl.TokenColumn>
        </styledEl.Body>
      </styledEl.Wrapper>
      <SelectTokenModal.DesktopChainPanel />
    </>
  )
}

// Re-export internal components for external use
export { SelectTokenModal }
