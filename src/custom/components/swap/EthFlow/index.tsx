import { EthFlowModal } from './containers/EthFlowModal'

export { EthFlowModal, type EthFlowProps } from './containers/EthFlowModal'
export default EthFlowModal

export enum EthFlowState {
  SwapReady, // 0
  WrapAndApproveNeeded, // 1
  WrapAndApprovePending, // 2
  ApproveNeeded, // 3
  WrapNeeded, // 4
  ApprovePending, // 5
  ApproveInsufficient, // 6
  ApproveFailed, // 7
  WrapUnwrapFailed, // 8
  WrapUnwrapPending, // 9
  WrapAndApproveFailed, // 10
  Loading, // 11
}
