import { isEvmAddress, isEvmChain, SupportedChainId } from '@cowprotocol/cow-sdk'

/**
 * Whether CoW Shed can derive a proxy for this account on this chain.
 *
 * The chain alone is not enough. Selecting an EVM chain while a Solana wallet is connected leaves
 * `walletInfo` holding a base58 account, and `proxyOf` ABI-encodes its argument as an `address`,
 * which throws `InvalidAddressError` on anything that is not 20 hex bytes.
 */
export function isEvmProxyOwner(account: string | undefined, chainId: SupportedChainId): account is string {
  return !!account && isEvmChain(chainId) && isEvmAddress(account)
}
