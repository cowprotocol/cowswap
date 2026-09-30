import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

interface OrderFundingToken {
  address: string
  symbol: string | undefined
}

/**
 * The token whose balance actually backs the order right now — both the balance to read and the symbol
 * to name in a warning about it.
 *
 * A sponsored Solana order sells WSOL for a native sell, but the wrap producing it sits in the bundle
 * the order book only submits once a solver wins — until then the funds are still native SOL.
 */
export function getOrderFundingToken(
  chainId: SupportedChainId,
  order: { isSponsored?: boolean; isNativeSell?: boolean; inputToken: OrderFundingToken },
): OrderFundingToken {
  if (order.isSponsored === true && order.isNativeSell === true) {
    const nativeCurrency = NATIVE_CURRENCIES[chainId]

    if (nativeCurrency) return { address: nativeCurrency.address, symbol: nativeCurrency.symbol }
  }

  return order.inputToken
}
