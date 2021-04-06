import React from 'react'
import { CurrencyAmount } from '@uniswap/sdk'

import { LONG_PRECISION } from 'constants/index'

import CurrencyListMod, { StyledBalanceText } from './CurrencyListMod'

export function Balance({ balance }: { balance: CurrencyAmount }) {
  return <StyledBalanceText title={balance.toExact()}>{balance.toSignificant(LONG_PRECISION)}</StyledBalanceText>
}

export default function CurrencyList(
  ...params: Parameters<typeof CurrencyListMod>
): ReturnType<typeof CurrencyListMod> {
  return <CurrencyListMod {...params[0]} BalanceComponent={Balance} />
}
