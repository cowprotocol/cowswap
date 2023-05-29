import { useMemo } from 'react'

import { GP_VAULT_RELAYER } from 'legacy/constants'

import { useWalletInfo } from 'modules/wallet'

export function useTradeSpenderAddress(): string | undefined {
  const { chainId } = useWalletInfo()

  return useMemo(() => (chainId ? GP_VAULT_RELAYER[chainId] : undefined), [chainId])
}
