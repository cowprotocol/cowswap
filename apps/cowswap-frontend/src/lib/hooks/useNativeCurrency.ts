import { useMemo } from 'react'

import { nativeOnChain } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'
import { NativeCurrency } from '@uniswap/sdk-core'

export const MAINNET_NATIVE_CURRENCY = nativeOnChain(SupportedChainId.MAINNET)

export default function useNativeCurrency(): NativeCurrency {
  const { chainId } = useWalletInfo()

  return useMemo(() => nativeOnChain(chainId), [chainId])
}
