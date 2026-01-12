import { useSetAtom } from 'jotai'
import { ReactNode, useEffect } from 'react'

import { customFlowsRegistryAtom } from './atoms'
import { useViewWithFlows } from './hooks'
import { SelectTokenModal } from './internal'
import { CustomFlowsRegistry, TokenSelectorView } from './types'

import { ImportTokenModalProps } from '../../pure/ImportTokenModal'
import * as styledEl from '../../pure/SelectTokenModal/styled'
import { updateSelectTokenWidgetAtom } from '../../state/selectTokenWidgetAtom'

export interface SelectTokenWidgetProps {
  displayLpTokenLists?: boolean
  standalone?: boolean
  /**
   * Custom flows registry - allows injecting pre/post flow views from outside.
   * This keeps the token selector domain-agnostic.
   *
   * @example
   * ```tsx
   * const customFlows: CustomFlowsRegistry = {
   *   [TokenSelectorView.ImportToken]: {
   *     preFlow: (context) => needsConsent
   *       ? <ConsentModal onConfirm={context.onDone} onCancel={context.onCancel} />
   *       : null
   *   }
   * }
   *
   * <SelectTokenWidget customFlows={customFlows} />
   * ```
   */
  customFlows?: CustomFlowsRegistry
}

/**
 * SelectTokenWidget - Token selector modal
 *
 * Uses slot-based composition with configurable custom flows.
 * Custom flows (like consent) are provided externally via the customFlows prop.
 */
export function SelectTokenWidget({ displayLpTokenLists, standalone, customFlows }: SelectTokenWidgetProps): ReactNode {
  const updateWidgetState = useSetAtom(updateSelectTokenWidgetAtom)
  const setCustomFlows = useSetAtom(customFlowsRegistryAtom)

  // Sync config props to atoms
  useEffect(() => {
    updateWidgetState({ displayLpTokenLists, standalone })
  }, [displayLpTokenLists, standalone, updateWidgetState])

  // Sync custom flows to atom
  useEffect(() => {
    setCustomFlows(customFlows ?? {})
  }, [customFlows, setCustomFlows])

  return (
    <SelectTokenModal.Root>
      <SelectTokenWidgetContent />
    </SelectTokenModal.Root>
  )
}

function SelectTokenWidgetContent(): ReactNode {
  const { baseView, preFlowResult, postFlowResult } = useViewWithFlows()

  // Generic flow content checks - applies to ALL views
  // If there's pre-flow content, render it instead of the base view
  if (preFlowResult?.content) {
    return preFlowResult.content
  }

  // If there's post-flow content, render it instead of the base view
  if (postFlowResult?.content) {
    return postFlowResult.content
  }

  // Render the base view with optional flow data
  if (baseView === TokenSelectorView.ImportToken) {
    return <SelectTokenModal.ImportToken flowData={preFlowResult?.data as Partial<ImportTokenModalProps>} />
  }
  if (baseView === TokenSelectorView.ImportList) return <SelectTokenModal.ImportList />
  if (baseView === TokenSelectorView.Manage) return <SelectTokenModal.Manage />
  if (baseView === TokenSelectorView.LpToken) return <SelectTokenModal.LpToken />

  // Default: Main token list view
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
