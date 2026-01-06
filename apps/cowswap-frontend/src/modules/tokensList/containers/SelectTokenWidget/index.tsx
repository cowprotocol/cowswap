import { ReactNode } from 'react'

import { SelectTokenWidgetV2, useHasBlockingView } from './v2'

import * as styledEl from '../../pure/SelectTokenModal/styled'

import type { SelectTokenWidgetProps } from './controller'

/**
 * SelectTokenWidget - Token selector modal
 *
 * Uses V2 architecture with slot-based composition.
 * Slots get their props from a context, reducing prop drilling.
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
    return <SelectTokenWidgetV2.BlockingView />
  }

  return (
    <>
      <styledEl.Wrapper>
        <SelectTokenWidgetV2.Header />
        <SelectTokenWidgetV2.Search />
        <SelectTokenWidgetV2.ChainSelector />
        <styledEl.Body>
          <styledEl.TokenColumn>
            <SelectTokenWidgetV2.TokenList />
          </styledEl.TokenColumn>
        </styledEl.Body>
      </styledEl.Wrapper>
      <SelectTokenWidgetV2.DesktopChainPanel />
    </>
  )
}

// Re-export V2 components for external use
export { SelectTokenWidgetV2 }
