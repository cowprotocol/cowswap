import { useMemo } from 'react'

import { CustomFlowsRegistry, TokenSelectorView } from 'modules/tokensList'

import { useListToggleConsentFlow } from './useListToggleConsentFlow'

/**
 * Hook that combines all RWA consent flows for the token selector.
 * Each individual flow is defined in its own hook.
 */
export function useTokenSelectorConsentFlow(): CustomFlowsRegistry {
  const listToggleFlow = useListToggleConsentFlow()

  return useMemo((): CustomFlowsRegistry => {
    const registry: CustomFlowsRegistry = {}

    if (listToggleFlow) {
      registry[TokenSelectorView.Manage] = listToggleFlow
    }

    return registry
  }, [listToggleFlow])
}
