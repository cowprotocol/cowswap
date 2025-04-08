import { useMemo } from 'react'

import { NATIVE_CURRENCIES, TokenWithLogo } from '@cowprotocol/common-const'
import { useWalletInfo } from '@cowprotocol/wallet'

export function useNativeCurrency(): TokenWithLogo {
  const { chainId } = useWalletInfo()

  return useMemo(() => NATIVE_CURRENCIES[chainId], [chainId])
}
