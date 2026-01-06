import { useSetAtom } from 'jotai'
import { ReactNode, useEffect } from 'react'

import { SelectTokenModal, useHasBlockingView } from './internal'

import * as styledEl from '../../pure/SelectTokenModal/styled'
import { updateSelectTokenWidgetAtom } from '../../state/selectTokenWidgetAtom'

export interface SelectTokenWidgetProps {
  displayLpTokenLists?: boolean
  standalone?: boolean
}

/**
 * SelectTokenWidget - Token selector modal
 *
 * Uses slot-based composition. Slots read from widget state atom directly.
 */
export function SelectTokenWidget({ displayLpTokenLists, standalone }: SelectTokenWidgetProps): ReactNode {
  const updateWidgetState = useSetAtom(updateSelectTokenWidgetAtom)

  // Sync config props to atom
  useEffect(() => {
    updateWidgetState({ displayLpTokenLists, standalone })
  }, [displayLpTokenLists, standalone, updateWidgetState])

  return (
    <SelectTokenModal>
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
