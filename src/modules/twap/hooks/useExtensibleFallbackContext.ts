import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Web3Provider } from '@ethersproject/providers'
import SafeAppsSDK from '@safe-global/safe-apps-sdk'
import { useWeb3React } from '@web3-react/core'

import { useGP2SettlementContract } from 'legacy/hooks/useContract'
import { isSupportedChain } from 'legacy/utils/supportedChainId'

import { useWalletInfo } from 'modules/wallet'
import { useSafeAppsSdk } from 'modules/wallet/web3-react/hooks/useSafeAppsSdk'

import { GPv2Settlement } from 'abis/types'

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
