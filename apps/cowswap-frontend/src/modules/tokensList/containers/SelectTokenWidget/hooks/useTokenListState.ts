import { useTokenDataSources } from './useTokenDataSources'

export function useTokenListState(): boolean | undefined {
  const { isRouteAvailable } = useTokenDataSources()
  return isRouteAvailable
}
