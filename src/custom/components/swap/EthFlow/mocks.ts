import { WrappingPreviewProps } from './pure/WrappingPreview'

import { nativeOnChain, WRAPPED_NATIVE_CURRENCY as WETH } from 'constants/tokens'
import { SupportedChainId } from 'constants/chains'
import { CurrencyAmount } from '@uniswap/sdk-core'

const ether = nativeOnChain(SupportedChainId.MAINNET)
const weth = WETH[SupportedChainId.MAINNET]
const nativeInput = CurrencyAmount.fromRawAmount(ether, 5.987654 * 10 ** 18)
const nativeBalance = CurrencyAmount.fromRawAmount(ether, 15.12123 * 10 ** 18)
const wrappedBalance = CurrencyAmount.fromRawAmount(weth, 15.12123 * 10 ** 18)

export const wrappingPreviewProps: WrappingPreviewProps = {
  native: ether,
  wrapped: weth,
  wrappedSymbol: 'WETH',
  nativeSymbol: 'ETH',
  nativeBalance,
  wrappedBalance,
  nativeInput,
}
