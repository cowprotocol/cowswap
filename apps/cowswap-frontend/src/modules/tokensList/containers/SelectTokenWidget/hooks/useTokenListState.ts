/**
 * useTokenListState - Returns isRouteAvailable for token list
 */
import { useTokenDataSources } from '../tokenDataHooks'

export function useTokenListState(): boolean | undefined {
  const { isRouteAvailable } = useTokenDataSources()
  return isRouteAvailable
}
