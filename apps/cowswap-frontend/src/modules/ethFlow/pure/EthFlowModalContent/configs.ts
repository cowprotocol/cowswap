import { i18n } from '@lingui/core'
import { msg, t } from '@lingui/core/macro'

import { EthFlowState } from '../../services/ethFlow/types'

export interface EthFlowConfig {
  title: string
  buttonText: string
  descriptions: string[]
}

const commonSingularTxProgressDescription = msg`Transaction in progress. See below for live status updates.`
const commonFailedSingularTxGasLimitDescription = msg`Check that you are providing a sufficient gas limit for the transaction in your wallet.`

export const ethFlowConfigs: {
  [key in EthFlowState]: (context: { nativeSymbol: string; wrappedSymbol: string }) => EthFlowConfig
} = {
  /**
   * FAILED operations
   */
  [EthFlowState.WrapFailed]: ({ nativeSymbol }) => ({
    title: t`Wrap ${nativeSymbol} failed`,
    buttonText: t`Wrap ${nativeSymbol}`,
    descriptions: [
      t`Wrap operation failed.`,
      i18n._(commonFailedSingularTxGasLimitDescription),
      t`Click "Wrap ${nativeSymbol}" to try again.`,
    ],
  }),
  [EthFlowState.ApproveFailed]: ({ wrappedSymbol }) => ({
    title: t`Approve ${wrappedSymbol} failed!`,
    buttonText: t`Approve ${wrappedSymbol}`,
    descriptions: [
      t`Approve operation failed.`,
      i18n._(commonFailedSingularTxGasLimitDescription),
      t`Click "Approve ${wrappedSymbol}" to try again.`,
    ],
  }),
  /**
   * PENDING operations
   */
  [EthFlowState.WrapPending]: ({ nativeSymbol }) => ({
    title: t`Swap with Wrapped ${nativeSymbol}`,
    buttonText: '',
    descriptions: [i18n._(commonSingularTxProgressDescription)],
  }),
  [EthFlowState.ApprovePending]: ({ wrappedSymbol }) => ({
    title: t`Approve ${wrappedSymbol}`,
    buttonText: '',
    descriptions: [i18n._(commonSingularTxProgressDescription)],
  }),
  [EthFlowState.ApproveInsufficient]: ({ wrappedSymbol }) => ({
    title: t`Approval amount insufficient!`,
    buttonText: t`Approve ${wrappedSymbol}`,
    descriptions: [
      t`Approval amount insufficient for input amount.`,
      t`Check that you are approving an amount equal to or greater than the input amount.`,
    ],
  }),
  /**
   * NEEDS operations
   */
  [EthFlowState.WrapNeeded]: ({ nativeSymbol, wrappedSymbol }) => ({
    title: t`Swap with Wrapped ${nativeSymbol}`,
    buttonText: t`Wrap ${nativeSymbol}`,
    descriptions: [
      t`To continue, click below to wrap your ${nativeSymbol} to ${wrappedSymbol} via an on-chain ERC20 transaction.`,
    ],
  }),
  [EthFlowState.ApproveNeeded]: ({ wrappedSymbol }) => ({
    title: t`Approve ${wrappedSymbol}`,
    buttonText: t`Approve ${wrappedSymbol}`,
    descriptions: [
      t`It is required to do a one-time approval of ${wrappedSymbol} via an on-chain ERC20 Approve transaction.`,
    ],
  }),
  [EthFlowState.SwapReady]: ({ wrappedSymbol }) => ({
    title: t`Continue swap with ${wrappedSymbol}`,
    buttonText: t`Swap`,
    descriptions: [t`To continue, click SWAP below to use your existing ${wrappedSymbol} balance and trade.`],
  }),
  [EthFlowState.Loading]: () => ({
    title: t`Loading operation`,
    buttonText: '',
    descriptions: [t`Operation in progress!`],
  }),
}
