import { useCallback, useMemo } from 'react'
import { Token } from '@uniswap/sdk-core'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import {
  toggleURLWarning,
  toggleFavouriteToken,
  removeAllFavouriteTokens,
  initFavouriteTokens,
} from 'state/user/reducer'
import { useUserTransactionTTL, serializeToken, deserializeToken } from '@src/state/user/hooks'
import { useWeb3React } from '@web3-react/core'
import { calculateValidTo } from '@cow/common/utils/calculateValidTo'

export * from '@src/state/user/hooks'

export function useURLWarningToggle(): () => void {
  const dispatch = useAppDispatch()
  return useCallback(() => dispatch(toggleURLWarning()), [dispatch])
}

export function useOrderValidTo() {
  const [deadline] = useUserTransactionTTL()
  return useMemo(() => ({ validTo: calculateValidTo(deadline), deadline }), [deadline])
}

export function useFavouriteTokens(): Token[] {
  const { chainId } = useWeb3React()
  const serializedTokensMap = useAppSelector(({ user: { favouriteTokens } }) => favouriteTokens)

  return useMemo(() => {
    if (!chainId) return []
    const tokenMap: Token[] = serializedTokensMap?.[chainId]
      ? Object.values(serializedTokensMap[chainId]).map(deserializeToken)
      : []
    return tokenMap
  }, [serializedTokensMap, chainId])
}

export function useToggleFavouriteToken(): (token: Token) => void {
  const dispatch = useAppDispatch()
  return useCallback(
    (token: Token) => {
      dispatch(toggleFavouriteToken({ serializedToken: serializeToken(token) }))
    },
    [dispatch]
  )
}

export function useRemoveAllFavouriteTokens(): () => void {
  const { chainId } = useWeb3React()
  const dispatch = useAppDispatch()

  return useCallback(() => {
    if (chainId) {
      dispatch(removeAllFavouriteTokens({ chainId }))
    }
  }, [dispatch, chainId])
}

export function useSelectedWallet(): string | undefined {
  return useAppSelector(({ user: { selectedWallet } }) => selectedWallet)
}

export function useInitFavouriteTokens(): void {
  const { chainId } = useWeb3React()
  const dispatch = useAppDispatch()

  return useMemo(() => {
    if (chainId) {
      dispatch(initFavouriteTokens({ chainId }))
    }
  }, [chainId, dispatch])
}
