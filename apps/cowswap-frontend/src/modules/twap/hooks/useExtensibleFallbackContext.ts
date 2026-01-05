import { useMemo } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { GPv2Settlement } from '@cowprotocol/cowswap-abis'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'
import { Web3Provider } from '@ethersproject/providers'

import { useGP2SettlementContract } from 'common/hooks/useContract'

export interface ExtensibleFallbackContext {
  safeAddress: string
  chainId: SupportedChainId
  settlementContract: GPv2Settlement
  provider: Web3Provider
}

export function useExtensibleFallbackContext(): ExtensibleFallbackContext | null {
  const { account } = useWalletInfo()
  const { contract: settlementContract, chainId: settlementChainId } = useGP2SettlementContract()
  const provider = useWalletProvider()

  return useMemo(() => {
    if (!account || !settlementContract || !provider) {
      return null
    }

    return { settlementContract, provider, chainId: settlementChainId, safeAddress: account }
  }, [account, settlementContract, provider, settlementChainId])
}
