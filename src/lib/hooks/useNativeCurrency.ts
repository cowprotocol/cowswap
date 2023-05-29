import { useMemo } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { NativeCurrency } from '@uniswap/sdk-core'

import { nativeOnChain } from 'legacy/constants/tokens'

import { useWalletInfo } from 'modules/wallet'

export const MAINNET_NATIVE_CURRENCY = nativeOnChain(SupportedChainId.MAINNET)

export default function useNativeCurrency(): NativeCurrency {
  const { chainId } = useWalletInfo()
  return useMemo(
    () =>
      chainId
        ? nativeOnChain(chainId)
        : // display mainnet when not connected
          MAINNET_NATIVE_CURRENCY,
    [chainId]
  )
}
