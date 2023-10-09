import { useMemo } from 'react'

import { NATIVE_CURRENCY_BUY_TOKEN, TokenWithLogo } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

export const MAINNET_NATIVE_CURRENCY = NATIVE_CURRENCY_BUY_TOKEN[SupportedChainId.MAINNET]

export default function useNativeCurrency(): TokenWithLogo {
  const { chainId } = useWalletInfo()

  return useMemo(() => NATIVE_CURRENCY_BUY_TOKEN[chainId], [chainId])
}
