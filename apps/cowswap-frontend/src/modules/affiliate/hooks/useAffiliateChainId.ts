import { isSolanaChain } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletChainId } from '@cowprotocol/wallet-provider'

export function useAffiliateChainId(): number | undefined {
  const { chainId } = useWalletInfo()
  const walletChainId = useWalletChainId()

  return isSolanaChain(chainId) ? chainId : walletChainId
}
