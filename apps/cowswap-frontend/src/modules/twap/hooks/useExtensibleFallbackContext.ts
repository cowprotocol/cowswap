import { useMemo } from 'react'

import { GPv2Settlement } from '@cowprotocol/abis'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
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
  const { chainId, account } = useWalletInfo()
  const settlementContract = useGP2SettlementContract()
  const provider = useWalletProvider()

  return useMemo(() => {
    if (!account || !settlementContract || !provider) {
      return null
    }

    return { settlementContract, provider, chainId, safeAddress: account }
  }, [account, settlementContract, provider, chainId])
}
