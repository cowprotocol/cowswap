import { useMemo } from 'react'

import { NATIVE_CURRENCIES, TokenWithLogo } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

export const MAINNET_NATIVE_CURRENCY = NATIVE_CURRENCIES[SupportedChainId.MAINNET]

export default function useNativeCurrency(): TokenWithLogo {
  const { chainId } = useWalletInfo()

  return useMemo(() => NATIVE_CURRENCIES[chainId], [chainId])
}
