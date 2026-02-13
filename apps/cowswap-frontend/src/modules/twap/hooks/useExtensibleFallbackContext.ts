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
  const {
    abi: settlementContractAbi,
    address: settlementContractAddress,
    chainId: settlementChainId,
  } = useGP2SettlementContractData()

  return useMemo(() => {
    if (!account || !settlementContractAddress) {
      return null
    }

    return {
      chainId: settlementChainId,
      config,
      safeAddress: account,
      settlementContract: {
        abi: settlementContractAbi,
        address: settlementContractAddress,
      },
    }
  }, [account, config, settlementChainId, settlementContractAbi, settlementContractAddress])
}
