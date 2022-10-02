import { WrappingPreviewProps } from './pure/WrappingPreview'

import { nativeOnChain, WRAPPED_NATIVE_CURRENCY as WETH } from 'constants/tokens'
import { SupportedChainId } from 'constants/chains'
import { CurrencyAmount } from '@uniswap/sdk-core'
import { EthFlowState } from './helpers'
import { ActionButtonParams } from './pure/EthFlowModalContent/EthFlowModalBottomContent'
import { ModalTextContentProps } from './pure/EthFlowModalContent'

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

export const actionButton: ActionButtonParams = {
  approveError: null,
  wrapError: null,
  approveState: null,
  wrapState: null,
  isExpertMode: false,
  nativeSymbol: wrappingPreviewProps.nativeSymbol,
  wrappedSymbol: wrappingPreviewProps.wrappedSymbol,
  state: EthFlowState.WrapNeeded,
  isWrap: false,
  isNativeIn: false,
  loading: false,
  handleSwap: async ({ showConfirm, straightSwap }) => {
    console.log('handleSwap', { showConfirm, straightSwap })
  },
  handleApprove: async () => console.log('handleApprove'),
  handleWrap: async () => console.log('handleApprove'),
  handleMountInExpertMode: async () => console.log('handleApprove'),
}

export const modalTextContent: ModalTextContentProps = {
  wrappedSymbol: actionButton.wrappedSymbol,
  nativeSymbol: actionButton.nativeSymbol,
  state: actionButton.state,
  isExpertMode: actionButton.isExpertMode,
  isNative: actionButton.isNativeIn,
  wrapSubmitted: false,
  approveSubmitted: false,
}
