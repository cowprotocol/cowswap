import { EthFlowModal } from './containers/EthFlowModal'

export { EthFlowModal, type EthFlowProps } from './containers/EthFlowModal'
export default EthFlowModal

export interface EthFlowContext {
  isExpertMode: boolean
  nativeSymbol: string
  wrappedSymbol: string
}

export enum EthFlowState {
  SwapReady = 'SwapReady',
  WrapAndApproveNeeded = 'WrapAndApproveNeeded',
  WrapAndApprovePending = 'WrapAndApprovePending',
  ApproveNeeded = 'ApproveNeeded',
  WrapNeeded = 'WrapNeeded',
  ApprovePending = 'ApprovePending',
  ApproveInsufficient = 'ApproveInsufficient',
  ApproveFailed = 'ApproveFailed',
  WrapUnwrapFailed = 'WrapUnwrapFailed',
  WrapUnwrapPending = 'WrapUnwrapPending',
  WrapAndApproveFailed = 'WrapAndApproveFailed',
  Loading = 'Loading',
}
