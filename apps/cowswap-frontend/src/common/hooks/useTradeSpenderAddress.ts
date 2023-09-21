import { useMemo } from 'react'

import { GP_VAULT_RELAYER } from '@cowprotocol/common-const'
import { useWalletInfo } from '@cowprotocol/wallet'

export function useTradeSpenderAddress(): string | undefined {
  const { chainId } = useWalletInfo()

  return useMemo(() => (chainId ? GP_VAULT_RELAYER[chainId] : undefined), [chainId])
}
