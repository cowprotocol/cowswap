import { GPv2Settlement } from '@cowprotocol/abis'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'

import { useGP2SettlementContract } from 'legacy/hooks/useContract'

import { useWalletInfo } from 'modules/wallet'

export interface ExtensibleFallbackContext {
  safeAddress: string
  chainId: SupportedChainId
  settlementContract: GPv2Settlement
  provider: Web3Provider
}

export function useExtensibleFallbackContext(): ExtensibleFallbackContext | null {
  const { chainId, account } = useWalletInfo()
  const settlementContract = useGP2SettlementContract()
  const { provider } = useWeb3React()

  if (!account || !settlementContract || !provider || !chainId) return null

  return { settlementContract, provider, chainId, safeAddress: account }
}
