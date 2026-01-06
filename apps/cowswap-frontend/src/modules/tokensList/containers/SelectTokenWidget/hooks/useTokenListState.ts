/**
 * useTokenListState - Token list slot state
 */
import { useTokenDataSources } from '../tokenDataHooks'

export interface TokenListState {
  isRouteAvailable: boolean | undefined
}

export function useTokenListState(): TokenListState {
  const { isRouteAvailable } = useTokenDataSources()

  return {
    isRouteAvailable,
  }
}
