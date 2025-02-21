import { useCallback } from 'react'

import { NATIVE_CURRENCIES, SupportedLocale, TokenWithLogo } from '@cowprotocol/common-const'
import { getIsNativeToken } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Command } from '@cowprotocol/types'
import { Currency } from '@uniswap/sdk-core'

import { shallowEqual } from 'react-redux'

import { updateHooksEnabled, updateUserDarkMode, updateUserLocale } from './reducer'
import { SerializedToken } from './types'

import { useAppDispatch, useAppSelector } from '../hooks'

export function useIsDarkMode(): boolean {
  const { userDarkMode, matchesDarkMode } = useAppSelector(
    ({ user: { matchesDarkMode, userDarkMode } }) => ({
      userDarkMode,
      matchesDarkMode,
    }),
    shallowEqual,
  )

  return userDarkMode === null ? matchesDarkMode : userDarkMode
}

export function useDarkModeManager(): [boolean, Command] {
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
    [dispatch],
  )

  return [locale, setLocale]
}

export function useHooksEnabled(): boolean {
  return useAppSelector((state) => state.user.hooksEnabled)
}

export function useHooksEnabledManager(): [boolean, Command] {
  const dispatch = useAppDispatch()
  const hooksEnabled = useHooksEnabled()

  const toggleHooksEnabled = useCallback(() => {
    dispatch(updateHooksEnabled({ hooksEnabled: !hooksEnabled }))
  }, [hooksEnabled, dispatch])

  return [hooksEnabled, toggleHooksEnabled]
}

export function useSelectedWallet(): string | undefined {
  return useAppSelector(({ user: { selectedWallet } }) => selectedWallet)
}

export function serializeToken(token: Currency | TokenWithLogo): SerializedToken {
  const address = getIsNativeToken(token) ? NATIVE_CURRENCIES[token.chainId as SupportedChainId].address : token.address

  return {
    address,
    logoURI: token instanceof TokenWithLogo ? token.logoURI : undefined,
    chainId: token.chainId,
    decimals: token.decimals,
    symbol: token.symbol || '',
    name: token.name || '',
  }
}
