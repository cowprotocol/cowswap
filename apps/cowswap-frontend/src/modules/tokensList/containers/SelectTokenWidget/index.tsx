import { useSetAtom } from 'jotai'
import { ReactNode, useEffect } from 'react'

import { useActiveBlockingView } from './hooks'
import { SelectTokenModal } from './internal'

import * as styledEl from '../../pure/SelectTokenModal/styled'
import { updateSelectTokenWidgetAtom } from '../../state/selectTokenWidgetAtom'

export interface SelectTokenWidgetProps {
  displayLpTokenLists?: boolean
  standalone?: boolean
}

/**
 * SelectTokenWidget - Token selector modal
 *
 * Uses slot-based composition
 */
export function SelectTokenWidget({ displayLpTokenLists, standalone }: SelectTokenWidgetProps): ReactNode {
  const updateWidgetState = useSetAtom(updateSelectTokenWidgetAtom)

  // Sync config props to atom
  useEffect(() => {
    updateWidgetState({ displayLpTokenLists, standalone })
  }, [displayLpTokenLists, standalone, updateWidgetState])

  return (
    <SelectTokenModal.Root>
      <SelectTokenWidgetContent />
    </SelectTokenModal.Root>
  )
}

function SelectTokenWidgetContent(): ReactNode {
  const activeView = useActiveBlockingView()

  // Blocking views
  if (activeView === 'importToken') return <SelectTokenModal.ImportToken />
  if (activeView === 'importList') return <SelectTokenModal.ImportList />
  if (activeView === 'manage') return <SelectTokenModal.Manage />
  if (activeView === 'lpToken') return <SelectTokenModal.LpToken />

  // Default token list view
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

// re-export for external use
export { SelectTokenModal }
