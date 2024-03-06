export enum EthFlowState {
  // Requires action
  SwapReady = 'SwapReady',
  ApproveNeeded = 'ApproveNeeded',
  WrapNeeded = 'WrapNeeded',
  // Error
  ApproveInsufficient = 'ApproveInsufficient',
  ApproveFailed = 'ApproveFailed',
  WrapFailed = 'WrapFailed',
  // Pending
  WrapPending = 'WrapPending',
  ApprovePending = 'ApprovePending',
  Loading = 'Loading',
}
