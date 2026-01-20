import { useChainsToSelect, useSelectTokenWidgetState } from 'modules/tokensList'

export function useIsTokenSelectWide(): boolean {
  const { open: isTokenSelectOpen } = useSelectTokenWidgetState()
  const chainsToSelect = useChainsToSelect()

  const hasChainsToSelect = !!chainsToSelect
  const isChainsLoading = chainsToSelect?.isLoading ?? false
  const hasAvailableChains = (chainsToSelect?.chains?.length ?? 0) > 0

  return isTokenSelectOpen && hasChainsToSelect && (isChainsLoading || hasAvailableChains)
}
