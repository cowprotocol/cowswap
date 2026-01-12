import { useAtomValue } from 'jotai'
import { ReactNode, useCallback, useMemo } from 'react'

import { useActiveBlockingView } from './useActiveBlockingView'

import { useUpdateSelectTokenWidgetState } from '../../../hooks/useUpdateSelectTokenWidgetState'
import { customFlowsRegistryAtom } from '../atoms'
import { CustomFlowContext, TokenSelectorView } from '../types'

/**
 * Result from useViewWithFlows hook
 */
export interface ViewWithFlowsResult {
  /** The base view (the current blocking view) */
  baseView: TokenSelectorView
  /** Pre-flow content to render, or null if no pre-flow */
  preFlowContent: ReactNode
  /** Post-flow content to render, or null if no post-flow */
  postFlowContent: ReactNode
}

/**
 * Hook that determines the current view and checks for custom pre/post flows.
 *
 * The custom flows are provided externally via props
 * This hook just checks the registry and renders the appropriate content.
 */
export function useViewWithFlows(): ViewWithFlowsResult {
  const baseView = useActiveBlockingView()
  const registry = useAtomValue(customFlowsRegistryAtom)
  const updateWidgetState = useUpdateSelectTokenWidgetState()

  // Create the flow context with callbacks
  const onDone = useCallback(() => {
    // pre-flow completed - the main view will now render
    // nothing to do here, the flow slot returns null when done
  }, [])

  const onCancel = useCallback(() => {
    // go back to main token list
    updateWidgetState({ tokenToImport: undefined, listToImport: undefined })
  }, [updateWidgetState])

  const flowContext: CustomFlowContext = useMemo(
    () => ({
      targetView: baseView,
      onDone,
      onCancel,
    }),
    [baseView, onDone, onCancel],
  )

  // check for custom flows
  const flowConfig = registry[baseView]
  const preFlowContent = flowConfig?.preFlow?.(flowContext) ?? null
  const postFlowContent = flowConfig?.postFlow?.(flowContext) ?? null

  return useMemo(
    (): ViewWithFlowsResult => ({
      baseView,
      preFlowContent,
      postFlowContent,
    }),
    [baseView, preFlowContent, postFlowContent],
  )
}
