import { useCallback, useMemo } from 'react'
import { Token } from '@uniswap/sdk-core'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import {
  toggleURLWarning,
  toggleFavouriteToken,
  removeAllFavouriteTokens,
  initFavouriteTokens,
} from 'state/user/reducer'
import { calculateValidTo } from 'hooks/useSwapCallback'
import { useUserTransactionTTL, serializeToken } from 'state/user/hooks'
import { useWeb3React } from '@web3-react/core'
import { SerializedToken } from 'state/user/types'
import { SerializedNativeCurrency } from 'state/orders/actions'
import { NATIVE_CURRENCY_BUY_TOKEN } from 'constants/index'
import { isAddress } from 'utils'

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

function _isErcToken(token: any): token is Token {
  return 'address' in token && !!isAddress(token.address)
}

export function deserializeToken(serializedToken: SerializedToken | SerializedNativeCurrency): Token {
  if (_isErcToken(serializedToken)) {
    return new Token(
      serializedToken.chainId,
      serializedToken.address,
      serializedToken.decimals,
      serializedToken.symbol,
      serializedToken.name
    )
  } else {
    return NATIVE_CURRENCY_BUY_TOKEN[serializedToken.chainId]
  }
}
