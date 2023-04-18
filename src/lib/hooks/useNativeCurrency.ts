import { NativeCurrency } from '@uniswap/sdk-core'
import { SupportedChainId } from '@src/constants/chains'
import { nativeOnChain } from 'constants/tokens'
import { useMemo } from 'react'
import { useWalletInfo } from '@cow/modules/wallet'

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
