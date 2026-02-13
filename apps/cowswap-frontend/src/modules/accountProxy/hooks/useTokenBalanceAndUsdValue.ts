import { useMemo } from 'react'

import { useTokensBalances } from '@cowprotocol/balances-and-allowances'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { getAddressKey } from '@cowprotocol/cow-sdk'
import { useTokensByAddressMap } from '@cowprotocol/tokens'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { useUsdAmount } from 'modules/usdAmount'

interface TokenBalanceAndUsdValue {
  balance: CurrencyAmount<TokenWithLogo> | null
  usdValue: CurrencyAmount<Token> | null
}

export function useTokenBalanceAndUsdValue(tokenAddress: string | undefined): TokenBalanceAndUsdValue {
  const tokensByAddress = useTokensByAddressMap()
  const { values: balances } = useTokensBalances()

  const tokenKey = tokenAddress ? getAddressKey(tokenAddress) : undefined

  const token = !!tokenKey && tokensByAddress[tokenKey]
  const balanceRaw = !!tokenKey && balances[tokenKey]

  const balance = (token && balanceRaw && CurrencyAmount.fromRawAmount(token, `0x${balanceRaw.toString(16)}`)) || null

  const { value: usdValue } = useUsdAmount(balance)

  return useMemo(() => ({ balance, usdValue }), [balance, usdValue])
}
