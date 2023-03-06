import { NativeCurrency, Token } from '@uniswap/sdk-core'
import { SupportedChainId } from '@src/constants/chains'
import { nativeOnChain } from 'constants/tokens'
import { useMemo } from 'react'
import { useWalletInfo } from '@cow/modules/wallet'

export default function useNativeCurrency(): NativeCurrency | Token {
  const { chainId } = useWalletInfo()
  return useMemo(
    () =>
      chainId
        ? nativeOnChain(chainId)
        : // display mainnet when not connected
          nativeOnChain(SupportedChainId.MAINNET),
    [chainId]
  )
}
