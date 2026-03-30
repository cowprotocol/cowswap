import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { usePersistBalancesFromBW } from '../hooks/usePersistBalancesFromBW'

export function BalancesBwUpdater({
  account,
  chainId,
  tokenListUrls,
  customTokenAddresses,
}: {
  account: string | undefined
  chainId: SupportedChainId
  tokenListUrls: string[]
  customTokenAddresses: string[]
}): null {
  usePersistBalancesFromBW({
    account,
    chainId,
    tokenListUrls,
    customTokenAddresses,
  })
  return null
}
