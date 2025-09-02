import { BFF_BASE_URL } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import useSWR, { SWRConfiguration, SWRResponse } from 'swr'

type BalanceResponse = {
  balances: Record<string, string> | null
}

export function useBalancesFromBff(
  account?: string,
  chainId?: SupportedChainId,
  swrConfig?: SWRConfiguration,
  isBffForBalancesEnabled = false,
): SWRResponse<Record<string, string> | null> {
  const { chainId: activeChainId, account: connectedAccount } = useWalletInfo()
  const targetAccount = account ?? connectedAccount
  const targetChainId = chainId ?? activeChainId

  return useSWR(
    isBffForBalancesEnabled && targetAccount ? [targetAccount, targetChainId, 'bff-balances'] : null,
    ([walletAddress, chainId]) => getBffBalances(walletAddress, chainId),
    swrConfig,
  )
}

export async function getBffBalances(
  address: string,
  chainId: SupportedChainId,
): Promise<Record<string, string> | null> {
  const url = `${BFF_BASE_URL}/${chainId}/tokens/${address}/balances`

  try {
    const res = await fetch(url)

    // todo add status code handling

    const data: BalanceResponse = await res.json()

    if (!data.balances) {
      return null
    }

    return data.balances
  } catch (error) {
    return Promise.reject(error)
  }
}
