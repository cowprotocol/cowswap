import { useMemo } from 'react'

import { NATIVE_CURRENCIES, TokenWithLogo } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { toHex } from 'viem'

import { useNativeTokenBalance } from './useNativeTokenBalance'

export function useNativeCurrencyAmount(
  chainId: SupportedChainId,
  account: string | undefined,
): CurrencyAmount<TokenWithLogo> | undefined {
  const { data } = useNativeTokenBalance(account)
  const balance = data?.value && toHex(data.value)

  return useMemo(() => {
    if (!balance) return undefined

    const nativeToken = NATIVE_CURRENCIES[chainId]

    return CurrencyAmount.fromRawAmount(nativeToken, balance)
  }, [chainId, balance])
}
