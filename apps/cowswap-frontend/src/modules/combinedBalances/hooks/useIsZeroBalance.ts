import { useMemo } from 'react'

import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { getAddressKey } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { Nullish } from '@cowprotocol/types'

import { useTokensBalancesCombined } from './useTokensBalancesCombined'

/**
 * Whether the given currency's live combined balance is exactly zero.
 *
 * Limit orders may be placed with an amount greater than the balance, so the confirm modal must
 * only block when the sell token balance drops to 0 (e.g. a previous order fully filled while the
 * modal was open), not whenever amount > balance (issue #5645).
 *
 * Returns `false` when there is no currency yet or before balances have loaded, so the button is
 * not blocked by a transient zero while `values` is still empty (issue #5645).
 */
export function useIsZeroBalance(currency: Nullish<Currency>): boolean {
  const { values: balances, hasFirstLoad } = useTokensBalancesCombined()

  return useMemo(() => {
    if (!currency || !hasFirstLoad) return false

    const balanceRaw = balances[getAddressKey(getCurrencyAddress(currency))]
    const balance = CurrencyAmount.fromRawAmount(currency, balanceRaw?.toString() ?? '0')

    return balance.equalTo(0)
  }, [balances, hasFirstLoad, currency])
}
