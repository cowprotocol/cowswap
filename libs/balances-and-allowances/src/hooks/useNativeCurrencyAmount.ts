import { useMemo } from 'react'

import { NATIVE_CURRENCIES, TokenWithLogo } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { useNativeTokenBalance } from './useNativeTokenBalance'

export function useNativeCurrencyAmount(
  chainId: SupportedChainId,
  account: string | undefined
): CurrencyAmount<TokenWithLogo> | undefined {
  const { data: nativeTokenBalance } = useNativeTokenBalance(account)

  return useMemo(() => {
    if (!nativeTokenBalance) return undefined

    const nativeToken = NATIVE_CURRENCIES[chainId]

    return CurrencyAmount.fromRawAmount(nativeToken, nativeTokenBalance.toHexString())
  }, [chainId, nativeTokenBalance])
}
