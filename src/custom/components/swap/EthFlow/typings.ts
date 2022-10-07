export enum EthFlowState {
  // Requires action
  SwapReady = 'SwapReady',
  WrapAndApproveNeeded = 'WrapAndApproveNeeded',
  ApproveNeeded = 'ApproveNeeded',
  WrapNeeded = 'WrapNeeded',
  // Error
  ApproveInsufficient = 'ApproveInsufficient',
  ApproveFailed = 'ApproveFailed',
  WrapFailed = 'WrapFailed',
  WrapAndApproveFailed = 'WrapAndApproveFailed',
  // Pending
  WrapAndApprovePending = 'WrapAndApprovePending',
  WrapPending = 'WrapPending',
  ApprovePending = 'ApprovePending',
  Loading = 'Loading',
}
