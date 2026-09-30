import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

/**
 * The token whose balance actually backs the order right now.
 *
 * A sponsored Solana order sells WSOL for a native sell, but the wrap producing it sits in the bundle
 * the order book only submits once a solver wins — until then the funds are still native SOL.
 */
export function getOrderFundingTokenAddress(
  chainId: SupportedChainId,
  order: { isSponsored?: boolean; isNativeSell?: boolean; inputToken: { address: string } },
): string {
  if (order.isSponsored === true && order.isNativeSell === true) {
    const nativeCurrency = NATIVE_CURRENCIES[chainId]

    if (nativeCurrency) return nativeCurrency.address
  }

  return order.inputToken.address
}
