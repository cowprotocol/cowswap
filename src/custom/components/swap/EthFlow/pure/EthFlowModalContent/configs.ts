import { EthFlowState } from 'components/swap/EthFlow'

export interface EthFlowContext {
  isExpertMode: boolean
  nativeSymbol: string
  wrappedSymbol: string
}

export interface EthFlowConfig {
  title: string
  descriptions: string[]
}

const expertCommonDescription = 'Transaction signature required, please check your connected wallet'
const ethFlowDescription = (nativeSymbol: string) =>
  `The current version of CoW Swap can’t yet use native ${nativeSymbol} to execute a trade (Look out for that feature coming soon!).`

export const ethFlowConfigs: { [key in EthFlowState]: (context: EthFlowContext) => EthFlowConfig } = {
  /**
   * FAILED operations
   * wrap/approve/both in expertMode failed
   */
  [EthFlowState.WrapAndApproveFailed]: () => ({
    title: 'Wrap and Approve failed!',
    descriptions: [
      'Both wrap and approve operations failed.',
      `Check that you are providing a sufficient gas limit for both transactions in your wallet. Click "Wrap and approve" to try again`,
    ],
  }),
  [EthFlowState.WrapUnwrapFailed]: ({ nativeSymbol, wrappedSymbol }) => ({
    title: `Wrap ${nativeSymbol} failed`,
    descriptions: [
      `Wrap operation failed.`,
      `Check that you are providing a sufficient gas limit for the transaction in your wallet. Click "Wrap ${nativeSymbol}" to try again`,
    ],
  }),
  [EthFlowState.ApproveFailed]: ({ nativeSymbol, wrappedSymbol }) => ({
    title: `Approve ${wrappedSymbol} failed!`,
    descriptions: [
      `Approve operation failed. Check that you are providing a sufficient gas limit for the transaction in your wallet`,
      `Click "Approve ${wrappedSymbol}" to try again`,
    ],
  }),
  /**
   * PENDING operations
   * wrap/approve/both in expertMode
   */
  [EthFlowState.WrapAndApprovePending]: () => ({
    title: 'Wrap and approve',
    descriptions: ['Transactions in progress', 'See below for live status updates of each operation'],
  }),
  [EthFlowState.WrapUnwrapPending]: ({ nativeSymbol }) => ({
    title: `Swap with Wrapped ${nativeSymbol}`,
    descriptions: ['Transaction in progress. See below for live status updates'],
  }),
  [EthFlowState.ApprovePending]: ({ wrappedSymbol }) => ({
    title: `Approve ${wrappedSymbol}`,
    descriptions: ['Transaction in progress. See below for live status updates'],
  }),
  [EthFlowState.ApproveInsufficient]: () => ({
    title: 'Approval amount insufficient!',
    descriptions: [
      'Approval amount insufficient for input amount',
      'Check that you are approving an amount equal to or greater than the input amount',
    ],
  }),
  /**
   * NEEDS operations
   * need to wrap/approve/both in expertMode
   */
  [EthFlowState.WrapAndApproveNeeded]: ({ nativeSymbol }) => ({
    title: 'Wrap and approve',
    descriptions: [
      `2 pending on-chain transactions: ${nativeSymbol} wrap and approve. Please check your connected wallet for both signature requests`,
    ],
  }),
  [EthFlowState.WrapNeeded]: ({ isExpertMode, nativeSymbol }) => ({
    title: `Swap with Wrapped ${nativeSymbol}`,
    descriptions: isExpertMode
      ? [expertCommonDescription]
      : [ethFlowDescription(nativeSymbol), 'TODO: You dont have enough wrapped token...'],
  }),
  [EthFlowState.ApproveNeeded]: ({ isExpertMode, nativeSymbol, wrappedSymbol }) => ({
    title: `Approve ${wrappedSymbol}`,
    descriptions: isExpertMode
      ? [expertCommonDescription]
      : [
          ethFlowDescription(nativeSymbol),
          `Additionally, it's also required to do a one-time approval of ${wrappedSymbol} via an on-chain ERC20 Approve transaction.`,
        ],
  }),
  [EthFlowState.SwapReady]: ({ isExpertMode, nativeSymbol, wrappedSymbol }) => ({
    title: `No need to wrap ${nativeSymbol}`,
    descriptions: isExpertMode
      ? []
      : [
          `For now, use your existing ${wrappedSymbol} balance to continue this trade.`,
          `You have enough ${wrappedSymbol} for this trade, so you don't need to wrap any more ${nativeSymbol} to continue with this trade.`,
          `Press SWAP to use ${wrappedSymbol} and continue trading.`,
        ],
  }),
  [EthFlowState.Loading]: () => ({
    title: 'Loading operation',
    descriptions: ['Operation in progress!'],
  }),
}
