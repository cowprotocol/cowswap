import { useMemo } from 'react'

import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { getAddressKey } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { Nullish } from '@cowprotocol/types'

import { useTokensBalancesCombined } from './useTokensBalancesCombined'

/**
 * Re-checks, against live combined balances, whether the given amount can still be afforded.
 *
 * The confirmation modals freeze their amounts when opened, but the balance can still change
 * underneath them (e.g. a previous order fills and spends it). This lets those modals disable
 * the Confirm button when the order became unaffordable while the modal was open (issue #5645).
 *
 * Returns `true` when there is no amount to check, so the button is not blocked during loading.
 */
export function useHasEnoughBalanceForAmount(inputAmount: Nullish<CurrencyAmount<Currency>>): boolean {
  const { values: balances } = useTokensBalancesCombined()

  return useMemo(() => {
    const currency = inputAmount?.currency

    if (!currency || !inputAmount) return true

    const balanceRaw = balances[getAddressKey(getCurrencyAddress(currency))]
    const balance = CurrencyAmount.fromRawAmount(currency, balanceRaw?.toString() ?? '0')

    return inputAmount.equalTo(balance) || inputAmount.lessThan(balance)
  }, [balances, inputAmount])
}
