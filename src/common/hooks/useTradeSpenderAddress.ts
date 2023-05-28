import { useMemo } from 'react'

import { useWalletInfo } from 'modules/wallet'

import { GP_VAULT_RELAYER } from 'legacy/constants'

export function useTradeSpenderAddress(): string | undefined {
  const { chainId } = useWalletInfo()

  return useMemo(() => (chainId ? GP_VAULT_RELAYER[chainId] : undefined), [chainId])
}
