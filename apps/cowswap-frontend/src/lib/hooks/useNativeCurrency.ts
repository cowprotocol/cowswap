import { useMemo } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { nativeOnChain } from '@cowswap/common-const'
import { useWalletInfo } from '@cowswap/wallet'
import { NativeCurrency } from '@uniswap/sdk-core'

export const MAINNET_NATIVE_CURRENCY = nativeOnChain(SupportedChainId.MAINNET)

export default function useNativeCurrency(): NativeCurrency {
  const { chainId } = useWalletInfo()

  return useMemo(() => nativeOnChain(chainId), [chainId])
}
