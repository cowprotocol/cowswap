import { useMemo } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { type Config, useConfig } from 'wagmi'

import { type SettlementContractData, useGP2SettlementContractData } from 'common/hooks/useContract'

export interface ExtensibleFallbackContext {
  chainId: SupportedChainId
  config: Config
  safeAddress: string
  settlementContract: SettlementContractData
}

export function useExtensibleFallbackContext(): ExtensibleFallbackContext | null {
  const config = useConfig()
  const { account } = useWalletInfo()
  const settlementContract = useGP2SettlementContractData()

  return useMemo(() => {
    if (!account || !settlementContract.address) {
      return null
    }

    return {
      chainId: settlementContract.chainId,
      config,
      safeAddress: account,
      settlementContract,
    }
  }, [account, config, settlementContract])
}
