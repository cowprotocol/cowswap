import { GPv2Settlement } from '@cowprotocol/abis'
import { useGP2SettlementContract } from '@cowprotocol/common-hooks'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'

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
