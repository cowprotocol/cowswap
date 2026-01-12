import { useAtomValue } from 'jotai'
import { useCallback, useMemo } from 'react'

import { useActiveBlockingView } from './useActiveBlockingView'

import { useUpdateSelectTokenWidgetState } from '../../../hooks/useUpdateSelectTokenWidgetState'
import { customFlowsRegistryAtom } from '../atoms'
import { CustomFlowContext, CustomFlowResult, TokenSelectorView } from '../types'

/**
 * Result from useViewWithFlows hook
 */
export interface ViewWithFlowsResult {
  /** The base view (the current blocking view) */
  baseView: TokenSelectorView
  /** Pre-flow result with content and typed data */
  preFlowResult: CustomFlowResult | null
  /** Post-flow result with content and typed data */
  postFlowResult: CustomFlowResult | null
}

/**
 * Hook that determines the current view and checks for custom pre/post flows.
 *
 * The custom flows are provided externally via props.
 * This hook checks the registry and returns the flow results.
 */
export function useViewWithFlows(): ViewWithFlowsResult {
  const baseView = useActiveBlockingView()
  const registry = useAtomValue(customFlowsRegistryAtom)
  const updateWidgetState = useUpdateSelectTokenWidgetState()

  // create the flow context with callbacks
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
  const preFlowResult = flowConfig?.preFlow?.(flowContext) ?? null
  const postFlowResult = flowConfig?.postFlow?.(flowContext) ?? null

  return useMemo(
    (): ViewWithFlowsResult => ({
      baseView,
      preFlowResult,
      postFlowResult,
    }),
    [baseView, preFlowResult, postFlowResult],
  )
}
