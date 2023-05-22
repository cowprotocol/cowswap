import SafeAppsSDK from '@safe-global/safe-apps-sdk'
import { GPv2Settlement } from 'abis/types'
import { useSafeAppsSdk } from 'modules/wallet/web3-react/hooks/useSafeAppsSdk'
import { useGP2SettlementContract } from 'legacy/hooks/useContract'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from 'modules/wallet'
import { isSupportedChain } from 'legacy/utils/supportedChainId'

export interface ExtensibleFallbackContext {
  chainId: SupportedChainId
  safeAppsSdk: SafeAppsSDK
  settlementContract: GPv2Settlement
  provider: Web3Provider
}

export function useExtensibleFallbackContext(): ExtensibleFallbackContext | null {
  const { chainId } = useWalletInfo()
  const safeAppsSdk = useSafeAppsSdk()
  const settlementContract = useGP2SettlementContract()
  const { provider } = useWeb3React()

  if (!safeAppsSdk || !settlementContract || !provider || !isSupportedChain(chainId)) return null

  return { safeAppsSdk, settlementContract, provider, chainId }
}
