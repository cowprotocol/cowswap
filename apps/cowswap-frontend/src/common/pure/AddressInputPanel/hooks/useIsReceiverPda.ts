import { isSolanaChain } from '@cowprotocol/cow-sdk'
import { isSolanaSmartContractWallet } from '@cowprotocol/sdk-trading-solana'
import { useWalletInfo } from '@cowprotocol/wallet'

/**
 * Whether a Solana-native trade pays out to a program-derived address, which has no key pair of its
 * own. False until the address has settled, and on every other chain — bridging *to* Solana keeps the
 * bridging confirmation instead, since there `chainId` is the EVM sell chain.
 */
export function useIsReceiverPda(address: string, isAddressSettled: boolean): boolean {
  const { chainId } = useWalletInfo()

  return isSolanaChain(chainId) && isAddressSettled && isSolanaSmartContractWallet(address)
}
