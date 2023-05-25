import { Currency, Percent, Token } from '@uniswap/sdk-core'
import { computePairAddress, Pair } from '@uniswap/v2-sdk'
import { L2_CHAIN_IDS } from 'legacy/constants/chains'
import { SupportedLocale } from 'legacy/constants/locales'
import { L2_DEADLINE_FROM_NOW } from 'legacy/constants/misc'
import useCurrentBlockTimestamp from 'legacy/hooks/useCurrentBlockTimestamp'
import JSBI from 'jsbi'
import { useCallback, useMemo } from 'react'
import { shallowEqual } from 'react-redux'
import { useAppDispatch, useAppSelector } from 'legacy/state/hooks'

import { V2_FACTORY_ADDRESSES } from '../../constants/addresses'
import { BASES_TO_TRACK_LIQUIDITY_FOR, PINNED_PAIRS } from '../../constants/routing'
import { useAllTokens } from '../../hooks/Tokens'
import { AppState } from 'legacy/state'
import {
  addSerializedPair,
  addSerializedToken,
  initFavouriteTokens,
  removeAllFavouriteTokens,
  removeSerializedToken,
  toggleFavouriteToken,
  toggleURLWarning,
  updateHideClosedPositions,
  // TODO: mod, move to mod file
  updateRecipientToggleVisible,
  updateShowDonationLink,
  updateShowSurveyPopup,
  updateUserClientSideRouter,
  updateUserDarkMode,
  updateUserDeadline,
  updateUserExpertMode,
  updateUserLocale,
  updateUserSlippageTolerance,
} from './reducer'
import { SerializedPair, SerializedToken } from './types'
import { useSwapActionHandlers } from '../swap/hooks'
import { useWalletInfo } from 'modules/wallet'
import { calculateValidTo } from 'utils/time'
import { NATIVE_CURRENCY_BUY_TOKEN } from 'legacy/constants'

export function deserializeToken(serializedToken: SerializedToken): Token {
  return new Token(
    serializedToken.chainId,
    serializedToken.address,
    serializedToken.decimals,
    serializedToken.symbol,
    serializedToken.name
  )
}

export function useIsDarkMode(): boolean {
  const { userDarkMode, matchesDarkMode } = useAppSelector(
    ({ user: { matchesDarkMode, userDarkMode } }) => ({
      userDarkMode,
      matchesDarkMode,
    }),
    shallowEqual
  )

  return userDarkMode === null ? matchesDarkMode : userDarkMode
}

export function useDarkModeManager(): [boolean, () => void] {
  const dispatch = useAppDispatch()
  const darkMode = useIsDarkMode()

  const toggleSetDarkMode = useCallback(() => {
    dispatch(updateUserDarkMode({ userDarkMode: !darkMode }))
  }, [darkMode, dispatch])

  return [darkMode, toggleSetDarkMode]
}

export function useUserLocale(): SupportedLocale | null {
  return useAppSelector((state) => state.user.userLocale)
}

export function useUserLocaleManager(): [SupportedLocale | null, (newLocale: SupportedLocale) => void] {
  const dispatch = useAppDispatch()
  const locale = useUserLocale()

  const setLocale = useCallback(
    (newLocale: SupportedLocale) => {
      dispatch(updateUserLocale({ userLocale: newLocale }))
    },
    [dispatch]
  )

  return [locale, setLocale]
}

export function useIsExpertMode(): boolean {
  return useAppSelector((state) => state.user.userExpertMode)
}

export function useExpertModeManager(): [boolean, () => void] {
  const dispatch = useAppDispatch()
  const expertMode = useIsExpertMode()

  const toggleSetExpertMode = useCallback(() => {
    dispatch(updateUserExpertMode({ userExpertMode: !expertMode }))
  }, [expertMode, dispatch])

  return [expertMode, toggleSetExpertMode]
}

export function useShowSurveyPopup(): [boolean | undefined, (showPopup: boolean) => void] {
  const dispatch = useAppDispatch()
  const showSurveyPopup = useAppSelector((state) => state.user.showSurveyPopup)
  const toggleShowSurveyPopup = useCallback(
    (showPopup: boolean) => {
      dispatch(updateShowSurveyPopup({ showSurveyPopup: showPopup }))
    },
    [dispatch]
  )
  return [showSurveyPopup, toggleShowSurveyPopup]
}

// TODO: mod, move to mod file
export function useIsRecipientToggleVisible(): boolean {
  return useAppSelector((state) => state.user.recipientToggleVisible)
}

// TODO: mod, move to mod file
export function useRecipientToggleManager(): [boolean, (value?: boolean) => void] {
  const dispatch = useAppDispatch()
  const isVisible = useIsRecipientToggleVisible()
  const { onChangeRecipient } = useSwapActionHandlers()

  const toggleVisibility = useCallback(
    (value?: boolean) => {
      const newIsVisible = value ?? !isVisible
      dispatch(updateRecipientToggleVisible({ recipientToggleVisible: newIsVisible }))
      if (!newIsVisible) {
        onChangeRecipient(null)
      }
    },
    [isVisible, dispatch, onChangeRecipient]
  )

  return [isVisible, toggleVisibility]
}

const DONATION_END_TIMESTAMP = 1646864954 // Jan 15th

export function useShowDonationLink(): [boolean | undefined, (showDonationLink: boolean) => void] {
  const dispatch = useAppDispatch()
  const showDonationLink = useAppSelector((state) => state.user.showDonationLink)

  const toggleShowDonationLink = useCallback(
    (showPopup: boolean) => {
      dispatch(updateShowDonationLink({ showDonationLink: showPopup }))
    },
    [dispatch]
  )

  const timestamp = useCurrentBlockTimestamp()
  const durationOver = timestamp ? timestamp.toNumber() > DONATION_END_TIMESTAMP : false
  const donationVisible = showDonationLink !== false && !durationOver

  return [donationVisible, toggleShowDonationLink]
}

export function useClientSideRouter(): [boolean, (userClientSideRouter: boolean) => void] {
  const dispatch = useAppDispatch()

  const clientSideRouter = useAppSelector((state) => Boolean(state.user.userClientSideRouter))

  const setClientSideRouter = useCallback(
    (newClientSideRouter: boolean) => {
      dispatch(updateUserClientSideRouter({ userClientSideRouter: newClientSideRouter }))
    },
    [dispatch]
  )

  return [clientSideRouter, setClientSideRouter]
}

export function useSetUserSlippageTolerance(): (slippageTolerance: Percent | 'auto') => void {
  const dispatch = useAppDispatch()

  return useCallback(
    (userSlippageTolerance: Percent | 'auto') => {
      let value: 'auto' | number
      try {
        value =
          userSlippageTolerance === 'auto' ? 'auto' : JSBI.toNumber(userSlippageTolerance.multiply(10_000).quotient)
      } catch (error: any) {
        value = 'auto'
      }
      dispatch(
        updateUserSlippageTolerance({
          userSlippageTolerance: value,
        })
      )
    },
    [dispatch]
  )
}

/**
 * Return the user's slippage tolerance, from the redux store, and a function to update the slippage tolerance
 */
export function useUserSlippageTolerance(): Percent | 'auto' {
  const userSlippageTolerance = useAppSelector((state) => {
    return state.user.userSlippageTolerance
  })

  return useMemo(
    () => (userSlippageTolerance === 'auto' ? 'auto' : new Percent(userSlippageTolerance, 10_000)),
    [userSlippageTolerance]
  )
}

export function useUserHideClosedPositions(): [boolean, (newHideClosedPositions: boolean) => void] {
  const dispatch = useAppDispatch()

  const hideClosedPositions = useAppSelector((state) => state.user.userHideClosedPositions)

  const setHideClosedPositions = useCallback(
    (newHideClosedPositions: boolean) => {
      dispatch(updateHideClosedPositions({ userHideClosedPositions: newHideClosedPositions }))
    },
    [dispatch]
  )

  return [hideClosedPositions, setHideClosedPositions]
}

/**
 * Same as above but replaces the auto with a default value
 * @param defaultSlippageTolerance the default value to replace auto with
 */
export function useUserSlippageToleranceWithDefault(defaultSlippageTolerance: Percent): Percent {
  const allowedSlippage = useUserSlippageTolerance()
  return useMemo(
    () => (allowedSlippage === 'auto' ? defaultSlippageTolerance : allowedSlippage),
    [allowedSlippage, defaultSlippageTolerance]
  )
}

export function useUserTransactionTTL(): [number, (slippage: number) => void] {
  const { chainId } = useWalletInfo()
  const dispatch = useAppDispatch()
  const userDeadline = useAppSelector((state) => state.user.userDeadline)
  const onL2 = Boolean(chainId && L2_CHAIN_IDS.includes(chainId))
  const deadline = onL2 ? L2_DEADLINE_FROM_NOW : userDeadline

  const setUserDeadline = useCallback(
    (userDeadline: number) => {
      dispatch(updateUserDeadline({ userDeadline }))
    },
    [dispatch]
  )

  return [deadline, setUserDeadline]
}

export function useAddUserToken(): (token: Token) => void {
  const dispatch = useAppDispatch()
  return useCallback(
    (token: Token) => {
      dispatch(addSerializedToken({ serializedToken: serializeToken(token) }))
    },
    [dispatch]
  )
}

export function useRemoveUserAddedToken(): (chainId: number, address: string) => void {
  const dispatch = useAppDispatch()
  return useCallback(
    (chainId: number, address: string) => {
      dispatch(removeSerializedToken({ chainId, address }))
    },
    [dispatch]
  )
}

export function useUserAddedTokens(): Token[] {
  const { chainId } = useWalletInfo()
  const serializedTokensMap = useAppSelector(({ user: { tokens } }) => tokens)

  return useMemo(() => {
    if (!chainId) return []
    const tokenMap: Token[] = serializedTokensMap?.[chainId]
      ? Object.values(serializedTokensMap[chainId]).map(deserializeToken)
      : []
    return tokenMap
  }, [serializedTokensMap, chainId])
}

function serializePair(pair: Pair): SerializedPair {
  return {
    token0: serializeToken(pair.token0),
    token1: serializeToken(pair.token1),
  }
}

export function usePairAdder(): (pair: Pair) => void {
  const dispatch = useAppDispatch()

  return useCallback(
    (pair: Pair) => {
      dispatch(addSerializedPair({ serializedPair: serializePair(pair) }))
    },
    [dispatch]
  )
}

export function useURLWarningVisible(): boolean {
  return useAppSelector((state: AppState) => state.user.URLWarningVisible)
}

/**
 * Given two tokens return the liquidity token that represents its liquidity shares
 * @param tokenA one of the two tokens
 * @param tokenB the other token
 */
export function toV2LiquidityToken([tokenA, tokenB]: [Token, Token]): Token {
  if (tokenA.chainId !== tokenB.chainId) throw new Error('Not matching chain IDs')
  if (tokenA.equals(tokenB)) throw new Error('Tokens cannot be equal')
  if (!V2_FACTORY_ADDRESSES[tokenA.chainId]) throw new Error('No V2 factory address on this chain')

  return new Token(
    tokenA.chainId,
    computePairAddress({ factoryAddress: V2_FACTORY_ADDRESSES[tokenA.chainId], tokenA, tokenB }),
    18,
    'UNI-V2',
    'Uniswap V2'
  )
}

/**
 * Returns all the pairs of tokens that are tracked by the user for the current chain ID.
 */
export function useTrackedTokenPairs(): [Token, Token][] {
  const { chainId } = useWalletInfo()
  const tokens = useAllTokens()

  // pinned pairs
  const pinnedPairs = useMemo(() => (chainId ? PINNED_PAIRS[chainId] ?? [] : []), [chainId])

  // pairs for every token against every base
  const generatedPairs: [Token, Token][] = useMemo(
    () =>
      chainId
        ? Object.keys(tokens).flatMap((tokenAddress) => {
            const token = tokens[tokenAddress]
            // for each token on the current chain,
            return (
              // loop though all bases on the current chain
              (BASES_TO_TRACK_LIQUIDITY_FOR[chainId] ?? [])
                // to construct pairs of the given token with each base
                .map((base) => {
                  if (base.address === token.address) {
                    return null
                  } else {
                    return [base, token]
                  }
                })
                .filter((p): p is [Token, Token] => p !== null)
            )
          })
        : [],
    [tokens, chainId]
  )

  // pairs saved by users
  const savedSerializedPairs = useAppSelector(({ user: { pairs } }) => pairs)

  const userPairs: [Token, Token][] = useMemo(() => {
    if (!chainId || !savedSerializedPairs) return []
    const forChain = savedSerializedPairs[chainId]
    if (!forChain) return []

    return Object.keys(forChain).map((pairId) => {
      return [deserializeToken(forChain[pairId].token0), deserializeToken(forChain[pairId].token1)]
    })
  }, [savedSerializedPairs, chainId])

  const combinedList = useMemo(
    () => userPairs.concat(generatedPairs).concat(pinnedPairs),
    [generatedPairs, pinnedPairs, userPairs]
  )

  return useMemo(() => {
    // dedupes pairs of tokens in the combined list
    const keyed = combinedList.reduce<{ [key: string]: [Token, Token] }>((memo, [tokenA, tokenB]) => {
      const sorted = tokenA.sortsBefore(tokenB)
      const key = sorted ? `${tokenA.address}:${tokenB.address}` : `${tokenB.address}:${tokenA.address}`
      if (memo[key]) return memo
      memo[key] = sorted ? [tokenA, tokenB] : [tokenB, tokenA]
      return memo
    }, {})

    return Object.keys(keyed).map((key) => keyed[key])
  }, [combinedList])
}

export function useURLWarningToggle(): () => void {
  const dispatch = useAppDispatch()
  return useCallback(() => dispatch(toggleURLWarning()), [dispatch])
}

export function useOrderValidTo() {
  const [deadline] = useUserTransactionTTL()
  return useMemo(() => ({ validTo: calculateValidTo(deadline), deadline }), [deadline])
}

export function useFavouriteTokens(): Token[] {
  const { chainId } = useWalletInfo()
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
  const { chainId } = useWalletInfo()
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
  const { chainId } = useWalletInfo()
  const dispatch = useAppDispatch()

  return useMemo(() => {
    if (chainId) {
      dispatch(initFavouriteTokens({ chainId }))
    }
  }, [chainId, dispatch])
}

export function serializeToken(token: Currency): SerializedToken {
  const address = token.isNative ? NATIVE_CURRENCY_BUY_TOKEN[token.chainId].address : token.address

  return {
    chainId: token.chainId,
    address,
    decimals: token.decimals,
    symbol: token.symbol,
    name: token.name,
  }
}
