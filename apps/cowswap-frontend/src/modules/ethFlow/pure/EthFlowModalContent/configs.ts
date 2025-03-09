import { EthFlowState } from '../../services/ethFlow/types'

export interface EthFlowConfig {
  title: string
  buttonText: string
  descriptions: string[]
}

const commonSingularTxProgressDescription = 'Transaction in progress. See below for live status updates.'
const commonFailedSingularTxGasLimitDescription =
  'Check that you are providing a sufficient gas limit for the transaction in your wallet.'

export const ethFlowConfigs: {
  [key in EthFlowState]: (context: { nativeSymbol: string; wrappedSymbol: string }) => EthFlowConfig
} = {
  /**
   * FAILED operations
   */
  [EthFlowState.WrapFailed]: ({ nativeSymbol }) => ({
    title: `Wrap ${nativeSymbol} failed`,
    buttonText: `Wrap ${nativeSymbol}`,
    descriptions: [
      'Wrap operation failed.',
      commonFailedSingularTxGasLimitDescription,
      `Click "Wrap ${nativeSymbol}" to try again.`,
    ],
  }),
  [EthFlowState.ApproveFailed]: ({ wrappedSymbol }) => ({
    title: `Approve ${wrappedSymbol} failed!`,
    buttonText: `Approve ${wrappedSymbol}`,
    descriptions: [
      'Approve operation failed.',
      commonFailedSingularTxGasLimitDescription,
      `Click "Approve ${wrappedSymbol}" to try again.`,
    ],
  }),
  /**
   * PENDING operations
   */
  [EthFlowState.WrapPending]: ({ nativeSymbol }) => ({
    title: `Swap with Wrapped ${nativeSymbol}`,
    buttonText: '',
    descriptions: [commonSingularTxProgressDescription],
  }),
  [EthFlowState.ApprovePending]: ({ wrappedSymbol }) => ({
    title: `Approve ${wrappedSymbol}`,
    buttonText: '',
    descriptions: [commonSingularTxProgressDescription],
  }),
  [EthFlowState.ApproveInsufficient]: ({ wrappedSymbol }) => ({
    title: 'Approval amount insufficient!',
    buttonText: `Approve ${wrappedSymbol}`,
    descriptions: [
      'Approval amount insufficient for input amount.',
      'Check that you are approving an amount equal to or greater than the input amount.',
    ],
  }),
  /**
   * NEEDS operations
   */
  [EthFlowState.WrapNeeded]: ({ nativeSymbol, wrappedSymbol }) => ({
    title: `Swap with Wrapped ${nativeSymbol}`,
    buttonText: `Wrap ${nativeSymbol}`,
    descriptions: [
      `To continue, click below to wrap your ${nativeSymbol} to ${wrappedSymbol} via an on-chain ERC20 transaction.`,
    ],
  }),
  [EthFlowState.ApproveNeeded]: ({ wrappedSymbol }) => ({
    title: `Approve ${wrappedSymbol}`,
    buttonText: `Approve ${wrappedSymbol}`,
    descriptions: [
      `It is required to do a one-time approval of ${wrappedSymbol} via an on-chain ERC20 Approve transaction.`,
    ],
  }),
  [EthFlowState.SwapReady]: ({ wrappedSymbol }) => ({
    title: `Continue swap with ${wrappedSymbol}`,
    buttonText: 'Swap',
    descriptions: [`To continue, click SWAP below to use your existing ${wrappedSymbol} balance and trade.`],
  }),
  [EthFlowState.Loading]: () => ({
    title: 'Loading operation',
    buttonText: '',
    descriptions: ['Operation in progress!'],
  }),
}
