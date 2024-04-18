import { useCallback, useMemo } from 'react'

import { L2_DEADLINE_FROM_NOW, NATIVE_CURRENCIES, SupportedLocale, TokenWithLogo } from '@cowprotocol/common-const'
import { getIsNativeToken } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Command } from '@cowprotocol/types'
import { Currency, Percent } from '@uniswap/sdk-core'

import JSBI from 'jsbi'
import { shallowEqual } from 'react-redux'

import {
  updateRecipientToggleVisible,
  updateUserDarkMode,
  updateUserDeadline,
  updateUserLocale,
  updateUserSlippageTolerance,
} from './reducer'
import { SerializedToken } from './types'

import { useAppDispatch, useAppSelector } from '../hooks'
import { setRecipient } from '../swap/actions'

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
    [dispatch]
  )

  return [locale, setLocale]
}

// TODO: mod, move to mod file
export function useIsRecipientToggleVisible(): boolean {
  return useAppSelector((state) => state.user.recipientToggleVisible)
}

// TODO: mod, move to mod file
export function useRecipientToggleManager(): [boolean, (value?: boolean) => void] {
  const dispatch = useAppDispatch()
  const isVisible = useIsRecipientToggleVisible()
  const onChangeRecipient = useCallback(
    (recipient: string | null) => {
      dispatch(setRecipient({ recipient }))
    },
    [dispatch]
  )

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
  const dispatch = useAppDispatch()
  const userDeadline = useAppSelector((state) => state.user.userDeadline)
  const onL2 = false
  const deadline = onL2 ? L2_DEADLINE_FROM_NOW : userDeadline

  const setUserDeadline = useCallback(
    (userDeadline: number) => {
      dispatch(updateUserDeadline({ userDeadline }))
    },
    [dispatch]
  )

  return [deadline, setUserDeadline]
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
