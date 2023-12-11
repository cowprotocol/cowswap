import { useMemo } from 'react'

import { NATIVE_CURRENCY_BUY_TOKEN, TokenWithLogo } from '@cowprotocol/common-const'
import { useWalletInfo } from '@cowprotocol/wallet'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { useNativeTokenBalance } from './useNativeTokenBalance'

export function useNativeCurrencyAmount(): CurrencyAmount<TokenWithLogo> | undefined {
  const { chainId } = useWalletInfo()
  const { data: nativeTokenBalance } = useNativeTokenBalance()

  return useMemo(() => {
    if (!nativeTokenBalance) return undefined

    const nativeToken = NATIVE_CURRENCY_BUY_TOKEN[chainId]

    return CurrencyAmount.fromRawAmount(nativeToken, nativeTokenBalance.toHexString())
  }, [chainId, nativeTokenBalance])
}
