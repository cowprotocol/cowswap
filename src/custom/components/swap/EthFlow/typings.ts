export enum EthFlowState {
  SwapReady = 'SwapReady',
  WrapAndApproveNeeded = 'WrapAndApproveNeeded',
  WrapAndApprovePending = 'WrapAndApprovePending',
  ApproveNeeded = 'ApproveNeeded',
  WrapNeeded = 'WrapNeeded',
  ApprovePending = 'ApprovePending',
  ApproveInsufficient = 'ApproveInsufficient',
  ApproveFailed = 'ApproveFailed',
  WrapFailed = 'WrapFailed',
  WrapPending = 'WrapPending',
  WrapAndApproveFailed = 'WrapAndApproveFailed',
  Loading = 'Loading',
}
