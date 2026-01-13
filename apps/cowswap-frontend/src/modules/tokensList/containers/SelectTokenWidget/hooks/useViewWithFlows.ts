import { useAtomValue } from 'jotai'
import { useCallback, useMemo } from 'react'

import { useActiveBlockingView } from './useActiveBlockingView'

import { useUpdateSelectTokenWidgetState } from '../../../hooks/useUpdateSelectTokenWidgetState'
import { customFlowsRegistryAtom } from '../atoms'
import { CustomFlowContext, CustomFlowResult, TokenSelectorView } from '../types'

/**
 * Helper type to create a view result with proper typing.
 */
type ViewResult<TView extends TokenSelectorView> = {
  baseView: TView
  preFlowResult: CustomFlowResult<TView> | null
  postFlowResult: CustomFlowResult<TView> | null
}

/**
 * Discriminated union for view with flows result.
 * Each union member has baseView as discriminant, allowing TypeScript to narrow flow result types.
 */
export type ViewWithFlowsResult =
  | ViewResult<TokenSelectorView.Main>
  | ViewResult<TokenSelectorView.ImportToken>
  | ViewResult<TokenSelectorView.ImportList>
  | ViewResult<TokenSelectorView.Manage>
  | ViewResult<TokenSelectorView.LpToken>

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

  // The cast is safe here because we're creating a consistent tuple:
  // baseView determines the type, and flow results come from the same view's config
  return useMemo(
    () =>
      ({
        baseView,
        preFlowResult,
        postFlowResult,
      }) as ViewWithFlowsResult,
    [baseView, preFlowResult, postFlowResult],
  )
}
