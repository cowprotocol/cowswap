import { useTokensToSelect } from '../../../hooks/useTokensToSelect'

export function useTokenListState(): boolean | undefined {
  const { isRouteAvailable } = useTokensToSelect()
  return isRouteAvailable
}
