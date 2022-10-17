import { WrappingPreview, WrappingPreviewProps } from '../WrappingPreview'

import SimpleAccountDetails from 'components/AccountDetails/SimpleAccountDetails'

import { ActionButton } from './ActionButton'
import { EthFlowState } from '../../typings'
import { useCallback, useMemo } from 'react'
import { EthFlowContext } from '../../state/ethFlowContextAtom'
import { EthFlowActions } from '../../containers/EthFlowModal/hooks/useEthFlowActions'
import { ActivityStatus } from 'hooks/useRecentActivity'

function runEthFlowAction(state: EthFlowState, ethFlowActions: EthFlowActions) {
  if (state === EthFlowState.WrapAndApproveFailed) {
    return ethFlowActions.expertModeFlow()
  }
  if (state === EthFlowState.SwapReady) {
    return ethFlowActions.swap()
  }
  if ([EthFlowState.WrapFailed, EthFlowState.WrapNeeded].includes(state)) {
    return ethFlowActions.wrap()
  }
  if ([EthFlowState.ApproveNeeded, EthFlowState.ApproveFailed, EthFlowState.ApproveInsufficient].includes(state)) {
    return ethFlowActions.approve()
  }
  return
}

export type BottomContentParams = {
  buttonText: string
  isExpertMode: boolean
  state: EthFlowState
  ethFlowActions: EthFlowActions
  ethFlowContext: EthFlowContext
  wrappingPreview: WrappingPreviewProps
}

export function EthFlowModalBottomContent(params: BottomContentParams) {
  const { state, buttonText, isExpertMode, ethFlowContext, ethFlowActions, wrappingPreview } = params
  const {
    approve: { txStatus: approveTxStatus, txHash: approveTxHash },
    wrap: { txStatus: wrapTxStatus, txHash: wrapTxHash },
  } = ethFlowContext

  const isFailedState = [
    EthFlowState.WrapAndApproveFailed,
    EthFlowState.WrapFailed,
    EthFlowState.ApproveFailed,
    EthFlowState.ApproveInsufficient,
  ].includes(state)
  // The only case in Expert mode when we display the button is WrapAndApproveFailed, @see getDerivedEthFlowState()
  const showButton = !isExpertMode || isFailedState
  const showWrapPreview = isExpertMode || ![EthFlowState.SwapReady, EthFlowState.ApproveNeeded].includes(state)

  const onClick = useCallback(() => {
    runEthFlowAction(state, ethFlowActions)
  }, [state, ethFlowActions])

  const showLoader = useMemo(() => {
    const approveInProgress = approveTxStatus !== null ? approveTxStatus === ActivityStatus.PENDING : !!approveTxHash
    const wrapInProgress = wrapTxStatus !== null ? wrapTxStatus === ActivityStatus.PENDING : !!wrapTxHash

    return approveInProgress || wrapInProgress
  }, [approveTxStatus, approveTxHash, wrapTxStatus, wrapTxHash])

  const pendingTransactions = useMemo(() => {
    const hashes = []
    if (approveTxHash) hashes.push(approveTxHash)
    if (wrapTxHash) hashes.push(wrapTxHash)
    return hashes
  }, [approveTxHash, wrapTxHash])

  return (
    <>
      {showWrapPreview && <WrappingPreview {...wrappingPreview} />}
      <SimpleAccountDetails pendingTransactions={pendingTransactions} confirmedTransactions={[]} $margin="12px 0 0" />
      {showButton && <ActionButton onClick={onClick} label={buttonText} showLoader={showLoader} />}
    </>
  )
}
