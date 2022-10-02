import { WrappingPreviewProps } from './pure/WrappingPreview'

import { nativeOnChain, WRAPPED_NATIVE_CURRENCY as WETH } from 'constants/tokens'
import { SupportedChainId } from 'constants/chains'
import { CurrencyAmount } from '@uniswap/sdk-core'
import {
  ActionButtonParams,
  BottomContentParams,
  EthFlowSwapCallbackParams,
} from './pure/EthFlowModalContent/EthFlowModalBottomContent'
import { EthFlowModalContentProps, ModalTextContentProps } from './pure/EthFlowModalContent'
import { EthFlowState } from '.'

const native = nativeOnChain(SupportedChainId.MAINNET)
const wrapped = WETH[SupportedChainId.MAINNET]
const nativeInput = CurrencyAmount.fromRawAmount(native, 5.987654 * 10 ** 18)
const nativeBalance = CurrencyAmount.fromRawAmount(native, 15.12123 * 10 ** 18)
const wrappedBalance = CurrencyAmount.fromRawAmount(wrapped, 15.12123 * 10 ** 18)

const wrappedSymbol = 'WETH'
const nativeSymbol = 'ETH'

const balanceChecks = { isLowBalance: false, txsRemaining: null }

const handleSwap = async ({ showConfirm, straightSwap }: EthFlowSwapCallbackParams) => {
  console.log('handleSwap', { showConfirm, straightSwap })
}

const handleApprove = async () => console.log('handleApprove')
const handleWrap = async () => console.log('handleApprove')
const handleMountInExpertMode = async () => console.log('handleApprove')

const state = EthFlowState.WrapNeeded

export const wrappingPreviewProps: WrappingPreviewProps = {
  native,
  wrapped,
  wrappedSymbol,
  nativeSymbol,
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
  nativeSymbol,
  wrappedSymbol,

  state,
  isWrap: false,
  isNativeIn: false, // TODO: What is this for?
  loading: false,

  handleSwap,
  handleApprove,
  handleWrap,
  handleMountInExpertMode,
}

export const modalTextContent: ModalTextContentProps = {
  wrappedSymbol,
  nativeSymbol,
  state,
  isExpertMode: false,
  isNative: false,
  wrapSubmitted: false,
  approveSubmitted: false,
}

const pendingHashMap = { approveHash: undefined, wrapHash: undefined }
export const bottomContentParams: BottomContentParams = {
  isUnwrap: false,
  pendingHashMap,
  actionButton,
  wrappingPreview: wrappingPreviewProps,
}

export interface EthParamsCaseParams {
  state?: EthFlowState
  isNativeIn?: boolean
  isWrap?: boolean
  isUnwrap?: boolean
  isExpertMode?: boolean
  loading?: boolean
  wrapSubmitted?: boolean
  approveSubmitted?: boolean
}

// export interface WrapEthCaseParams {
//   actionButton: ActionButtonParams
//   modalTextContent: ModalTextContentProps
//   bottomContentParams: BottomContentParams
// }

export function getEthFlowModalContentProps(params: EthParamsCaseParams = {}): EthFlowModalContentProps {
  const {
    state = EthFlowState.WrapNeeded,
    isNativeIn = false,
    isWrap = false,
    isUnwrap = false,
    isExpertMode = false,
    loading = false,
    wrapSubmitted = false,
    approveSubmitted = false,
  } = params

  const actionButtonModified = { ...actionButton, state, isWrap, isNativeIn, loading, isExpertMode }
  const modalTextContentModified: ModalTextContentProps = {
    ...modalTextContent,
    state,
    isExpertMode,
    isNative: isNativeIn,
    wrapSubmitted,
    approveSubmitted,
  }
  const bottomContentParamsMod: BottomContentParams = {
    isUnwrap,
    actionButton: actionButtonModified,
    pendingHashMap,
    wrappingPreview: wrappingPreviewProps,
  }

  return {
    balanceChecks,
    modalTextContent: modalTextContentModified,
    bottomContentParams: bottomContentParamsMod,
    onDismiss: async () => console.log('On dismiss'),
  }
}
